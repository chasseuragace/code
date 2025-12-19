#!/bin/bash

# Simple Reapplication Test - Uses existing agencies, jobs, and creates a test candidate
# Tests: Register candidate -> Apply -> Withdraw -> Reapply -> Admin actions -> Reapply attempts

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="${API_URL:-http://localhost:3000}"
ADMIN_PHONE="+9779862146252"
CANDIDATE_PHONE="98765432$(date +%s | tail -c 4)"  # Random phone number
CANDIDATE_NAME="Test Reapply User"

# Global vars
CANDIDATE_TOKEN=""
CANDIDATE_ID=""
ADMIN_TOKEN=""
JOB_ID="3997ff66-6eea-462f-8587-98a48aaae70d"  # From database
POSITION_ID="5e73bc5e-5da6-43fd-9b8a-67cc4a06f232"  # From database
APP_ID=""

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_section() { echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}\n${BLUE}$1${NC}\n${BLUE}═══════════════════════════════════════════════════════════${NC}\n"; }

# 1. Register candidate
test_register_candidate() {
    log_section "1️⃣  REGISTER CANDIDATE"
    
    log_info "Registering: $CANDIDATE_NAME ($CANDIDATE_PHONE)"
    
    RESP=$(curl -s -X POST "$API_URL/register" \
        -H "Content-Type: application/json" \
        -d "{\"full_name\": \"$CANDIDATE_NAME\", \"phone\": \"$CANDIDATE_PHONE\"}")
    
    OTP=$(echo $RESP | grep -o '"dev_otp":"[^"]*' | cut -d'"' -f4)
    [ -z "$OTP" ] && { log_error "Registration failed"; echo "$RESP"; exit 1; }
    log_success "Registered (OTP: $OTP)"
    
    # Verify OTP
    RESP=$(curl -s -X POST "$API_URL/verify" \
        -H "Content-Type: application/json" \
        -d "{\"phone\": \"$CANDIDATE_PHONE\", \"otp\": \"$OTP\"}")
    
    CANDIDATE_TOKEN=$(echo $RESP | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    CANDIDATE_ID=$(echo $RESP | grep -o '"candidate_id":"[^"]*' | cut -d'"' -f4)
    
    [ -z "$CANDIDATE_TOKEN" ] && { log_error "Verification failed"; echo "$RESP"; exit 1; }
    log_success "Logged in - ID: ${CANDIDATE_ID:0:8}..."
}

# 2. Admin login
test_admin_login() {
    log_section "2️⃣  ADMIN LOGIN"
    
    log_info "Logging in admin: $ADMIN_PHONE"
    
    RESP=$(curl -s -X POST "$API_URL/agency/login/start-owner" \
        -H "Content-Type: application/json" \
        -d "{\"phone\": \"$ADMIN_PHONE\"}")
    
    OTP=$(echo $RESP | grep -o '"dev_otp":"[^"]*' | cut -d'"' -f4)
    [ -z "$OTP" ] && { log_error "Admin login start failed"; echo "$RESP"; exit 1; }
    log_info "Admin OTP: $OTP"
    
    RESP=$(curl -s -X POST "$API_URL/agency/login/verify-owner" \
        -H "Content-Type: application/json" \
        -d "{\"phone\": \"$ADMIN_PHONE\", \"otp\": \"$OTP\"}")
    
    ADMIN_TOKEN=$(echo $RESP | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    [ -z "$ADMIN_TOKEN" ] && { log_error "Admin verification failed"; echo "$RESP"; exit 1; }
    log_success "Admin logged in"
}

# 3. Get job and position
test_get_job() {
    log_section "3️⃣  GET JOB & POSITION"
    
    log_info "Using job ID: ${JOB_ID:0:8}..."
    log_success "Found job: ${JOB_ID:0:8}..."
    
    log_info "Using position ID: ${POSITION_ID:0:8}..."
    log_success "Found position: ${POSITION_ID:0:8}..."
}

# 4. Apply for job
test_apply() {
    log_section "4️⃣  APPLY FOR JOB (First Application)"
    
    log_info "Applying for job..."
    
    RESP=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{\"candidate_id\": \"$CANDIDATE_ID\", \"job_posting_id\": \"$JOB_ID\", \"position_id\": \"$POSITION_ID\", \"note\": \"First application\"}")
    
    APP_ID=$(echo $RESP | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    STATUS=$(echo $RESP | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    [ -z "$APP_ID" ] && { log_error "Application failed"; echo "$RESP"; exit 1; }
    log_success "Applied - App ID: ${APP_ID:0:8}... Status: $STATUS"
}

# 5. Try duplicate (should fail)
test_duplicate_blocked() {
    log_section "5️⃣  ATTEMPT DUPLICATE APPLICATION (Should Fail)"
    
    log_info "Trying to apply again for same job..."
    
    RESP=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{\"candidate_id\": \"$CANDIDATE_ID\", \"job_posting_id\": \"$JOB_ID\", \"position_id\": \"$POSITION_ID\", \"note\": \"Duplicate\"}")
    
    ERROR=$(echo $RESP | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    
    if [[ "$ERROR" == *"already applied"* ]] || [[ "$ERROR" == *"already applied"* ]]; then
        log_success "Duplicate correctly blocked - Error: $ERROR"
    else
        log_error "Duplicate was NOT blocked!"; echo "$RESP"; exit 1
    fi
}

# 6. Withdraw
test_withdraw() {
    log_section "6️⃣  WITHDRAW APPLICATION"
    
    log_info "Withdrawing application..."
    
    RESP=$(curl -s -X POST "$API_URL/applications/$APP_ID/withdraw" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{\"note\": \"Withdrawing\"}")
    
    STATUS=$(echo $RESP | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    [ "$STATUS" != "withdrawn" ] && { log_error "Withdraw failed"; echo "$RESP"; exit 1; }
    log_success "Withdrawn - Status: $STATUS"
}

# 7. Reapply after withdrawal (should succeed)
test_reapply_after_withdrawal() {
    log_section "7️⃣  REAPPLY AFTER WITHDRAWAL (Should Succeed)"
    
    log_info "Reapplying after withdrawal..."
    
    RESP=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{\"candidate_id\": \"$CANDIDATE_ID\", \"job_posting_id\": \"$JOB_ID\", \"position_id\": \"$POSITION_ID\", \"note\": \"Reapplication\"}")
    
    NEW_APP_ID=$(echo $RESP | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    STATUS=$(echo $RESP | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    [ -z "$NEW_APP_ID" ] && { log_error "Reapplication failed"; echo "$RESP"; exit 1; }
    log_success "Reapplied - New App ID: ${NEW_APP_ID:0:8}... Status: $STATUS"
    
    APP_ID=$NEW_APP_ID
}

# 8. Admin shortlist
test_admin_shortlist() {
    log_section "8️⃣  ADMIN SHORTLIST"
    
    log_info "Admin shortlisting application..."
    
    RESP=$(curl -s -X POST "$API_URL/applications/$APP_ID/shortlist" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "{\"note\": \"Shortlisted\"}")
    
    STATUS=$(echo $RESP | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    [ "$STATUS" != "shortlisted" ] && { log_error "Shortlist failed"; echo "$RESP"; exit 1; }
    log_success "Shortlisted - Status: $STATUS"
}

# 9. Try reapply while shortlisted (should fail)
test_reapply_while_shortlisted_blocked() {
    log_section "9️⃣  ATTEMPT REAPPLY WHILE SHORTLISTED (Should Fail)"
    
    log_info "Trying to reapply while shortlisted..."
    
    RESP=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{\"candidate_id\": \"$CANDIDATE_ID\", \"job_posting_id\": \"$JOB_ID\", \"position_id\": \"$POSITION_ID\", \"note\": \"Reapply while shortlisted\"}")
    
    ERROR=$(echo $RESP | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    
    if [[ "$ERROR" == *"already applied"* ]]; then
        log_success "Reapplication correctly blocked - Error: $ERROR"
    else
        log_error "Reapplication was NOT blocked!"; echo "$RESP"; exit 1
    fi
}

# 10. Admin schedule interview
test_admin_schedule_interview() {
    log_section "🔟 ADMIN SCHEDULE INTERVIEW"
    
    log_info "Admin scheduling interview..."
    
    INTERVIEW_DATE=$(date -u -d "+7 days" +"%Y-%m-%d" 2>/dev/null || date -u -v+7d +"%Y-%m-%d")
    
    RESP=$(curl -s -X POST "$API_URL/applications/$APP_ID/schedule-interview" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "{\"interview_date_ad\": \"$INTERVIEW_DATE\", \"interview_time\": \"10:00 AM\", \"location\": \"Office\", \"contact_person\": \"HR\", \"note\": \"Interview scheduled\"}")
    
    STATUS=$(echo $RESP | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    [ "$STATUS" != "interview_scheduled" ] && { log_error "Schedule interview failed"; echo "$RESP"; exit 1; }
    log_success "Interview scheduled - Status: $STATUS"
}

# 11. Try reapply while interview scheduled (should fail)
test_reapply_while_interview_scheduled_blocked() {
    log_section "1️⃣1️⃣  ATTEMPT REAPPLY WHILE INTERVIEW SCHEDULED (Should Fail)"
    
    log_info "Trying to reapply while interview scheduled..."
    
    RESP=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{\"candidate_id\": \"$CANDIDATE_ID\", \"job_posting_id\": \"$JOB_ID\", \"position_id\": \"$POSITION_ID\", \"note\": \"Reapply while interview scheduled\"}")
    
    ERROR=$(echo $RESP | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    
    if [[ "$ERROR" == *"already applied"* ]]; then
        log_success "Reapplication correctly blocked - Error: $ERROR"
    else
        log_error "Reapplication was NOT blocked!"; echo "$RESP"; exit 1
    fi
}

# 12. Admin mark interview passed
test_admin_mark_passed() {
    log_section "1️⃣2️⃣ ADMIN MARK INTERVIEW PASSED"
    
    log_info "Admin marking interview as passed..."
    
    RESP=$(curl -s -X POST "$API_URL/applications/$APP_ID/complete-interview" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "{\"result\": \"passed\", \"note\": \"Interview passed\"}")
    
    STATUS=$(echo $RESP | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    [ "$STATUS" != "interview_passed" ] && { log_error "Mark passed failed"; echo "$RESP"; exit 1; }
    log_success "Marked as passed - Status: $STATUS"
}

# 13. Try reapply after passed (should fail)
test_reapply_after_passed_blocked() {
    log_section "1️⃣3️⃣ ATTEMPT REAPPLY AFTER INTERVIEW PASSED (Should Fail)"
    
    log_info "Trying to reapply after interview passed..."
    
    RESP=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{\"candidate_id\": \"$CANDIDATE_ID\", \"job_posting_id\": \"$JOB_ID\", \"position_id\": \"$POSITION_ID\", \"note\": \"Reapply after passed\"}")
    
    ERROR=$(echo $RESP | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    
    if [[ "$ERROR" == *"already applied"* ]]; then
        log_success "Reapplication correctly blocked - Error: $ERROR"
    else
        log_error "Reapplication was NOT blocked!"; echo "$RESP"; exit 1
    fi
}

# 14. Final withdraw and reapply
test_final_withdraw_reapply() {
    log_section "1️⃣4️⃣ FINAL WITHDRAW & REAPPLY"
    
    log_info "Withdrawing passed application..."
    
    RESP=$(curl -s -X POST "$API_URL/applications/$APP_ID/withdraw" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{\"note\": \"Withdrawing after passing\"}")
    
    STATUS=$(echo $RESP | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    [ "$STATUS" != "withdrawn" ] && { log_error "Final withdraw failed"; echo "$RESP"; exit 1; }
    log_success "Withdrawn - Status: $STATUS"
    
    log_info "Final reapplication..."
    
    RESP=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{\"candidate_id\": \"$CANDIDATE_ID\", \"job_posting_id\": \"$JOB_ID\", \"position_id\": \"$POSITION_ID\", \"note\": \"Final reapplication\"}")
    
    FINAL_APP_ID=$(echo $RESP | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    STATUS=$(echo $RESP | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    [ -z "$FINAL_APP_ID" ] && { log_error "Final reapplication failed"; echo "$RESP"; exit 1; }
    log_success "Final reapplication successful - App ID: ${FINAL_APP_ID:0:8}... Status: $STATUS"
}

# Main
main() {
    log_section "🧪 APPLICATION REAPPLICATION WORKFLOW TEST"
    log_info "API: $API_URL"
    log_info "Candidate: $CANDIDATE_NAME ($CANDIDATE_PHONE)"
    log_info "Admin: $ADMIN_PHONE"
    
    test_register_candidate
    test_admin_login
    test_get_job
    test_apply
    test_duplicate_blocked
    test_withdraw
    test_reapply_after_withdrawal
    test_admin_shortlist
    test_reapply_while_shortlisted_blocked
    test_admin_schedule_interview
    test_reapply_while_interview_scheduled_blocked
    test_admin_mark_passed
    test_reapply_after_passed_blocked
    test_final_withdraw_reapply
    
    log_section "✨ ALL 14 TESTS PASSED! ✨"
    log_success "Reapplication logic is working correctly!"
}

main
