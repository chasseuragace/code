#!/bin/bash

# Comprehensive Test Script for Application Reapplication Logic
# Tests: Login -> Search Job -> Apply -> Withdraw -> Reapply -> Admin Actions -> Reapply Attempts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
ADMIN_PHONE="+9779862146252"  # From database
ADMIN_PASSWORD="admin123"     # Default admin password

# Test data
CANDIDATE_PHONE="98765432100"
CANDIDATE_NAME="Test Candidate"

# Global variables to store tokens and IDs
CANDIDATE_TOKEN=""
CANDIDATE_ID=""
ADMIN_TOKEN=""
ADMIN_ID=""
JOB_POSTING_ID=""
POSITION_ID=""
APPLICATION_ID=""
INTERVIEW_ID=""

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

# Test 1: Register and login candidate
test_candidate_registration() {
    log_section "TEST 1: Candidate Registration & Login"
    
    log_info "Registering candidate: $CANDIDATE_NAME ($CANDIDATE_PHONE)"
    
    # Register
    REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"full_name\": \"$CANDIDATE_NAME\",
            \"phone\": \"$CANDIDATE_PHONE\"
        }")
    
    DEV_OTP=$(echo $REGISTER_RESPONSE | grep -o '"dev_otp":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$DEV_OTP" ]; then
        log_error "Failed to register candidate"
        echo "Response: $REGISTER_RESPONSE"
        return 1
    fi
    
    log_success "Candidate registered (OTP: $DEV_OTP)"
    
    # Verify OTP
    log_info "Verifying OTP..."
    VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/verify" \
        -H "Content-Type: application/json" \
        -d "{
            \"phone\": \"$CANDIDATE_PHONE\",
            \"otp\": \"$DEV_OTP\"
        }")
    
    CANDIDATE_TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    CANDIDATE_ID=$(echo $VERIFY_RESPONSE | grep -o '"candidate_id":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$CANDIDATE_TOKEN" ] || [ -z "$CANDIDATE_ID" ]; then
        log_error "Failed to verify OTP"
        echo "Response: $VERIFY_RESPONSE"
        return 1
    fi
    
    log_success "Candidate logged in"
    log_info "Candidate ID: $CANDIDATE_ID"
    log_info "Token: ${CANDIDATE_TOKEN:0:20}..."
}

# Test 2: Admin login
test_admin_login() {
    log_section "TEST 2: Admin Login"
    
    log_info "Logging in admin: $ADMIN_PHONE"
    
    # Start login OTP flow
    ADMIN_START=$(curl -s -X POST "$API_URL/agency/login/start-owner" \
        -H "Content-Type: application/json" \
        -d "{
            \"phone\": \"$ADMIN_PHONE\"
        }")
    
    ADMIN_OTP=$(echo $ADMIN_START | grep -o '"dev_otp":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$ADMIN_OTP" ]; then
        log_error "Failed to start admin login"
        echo "Response: $ADMIN_START"
        return 1
    fi
    
    log_info "Admin OTP: $ADMIN_OTP"
    
    # Verify OTP
    ADMIN_VERIFY=$(curl -s -X POST "$API_URL/agency/login/verify-owner" \
        -H "Content-Type: application/json" \
        -d "{
            \"phone\": \"$ADMIN_PHONE\",
            \"otp\": \"$ADMIN_OTP\"
        }")
    
    ADMIN_TOKEN=$(echo $ADMIN_VERIFY | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    ADMIN_ID=$(echo $ADMIN_VERIFY | grep -o '"user_id":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$ADMIN_TOKEN" ]; then
        log_error "Failed to verify admin OTP"
        echo "Response: $ADMIN_VERIFY"
        return 1
    fi
    
    log_success "Admin logged in"
    log_info "Admin ID: $ADMIN_ID"
}

# Test 3: Get available jobs
test_search_jobs() {
    log_section "TEST 3: Search & Get Available Jobs"
    
    log_info "Fetching available job postings..."
    
    JOBS_RESPONSE=$(curl -s -X GET "$API_URL/jobs?page=1&limit=10" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN")
    
    JOB_POSTING_ID=$(echo $JOBS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    
    if [ -z "$JOB_POSTING_ID" ]; then
        log_error "No jobs found"
        echo "Response: $JOBS_RESPONSE"
        return 1
    fi
    
    log_success "Found job posting: $JOB_POSTING_ID"
    
    # Get job details to find position
    log_info "Fetching job details..."
    JOB_DETAIL=$(curl -s -X GET "$API_URL/jobs/$JOB_POSTING_ID" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN")
    
    POSITION_ID=$(echo $JOB_DETAIL | grep -o '"id":"[^"]*' | grep -v "$JOB_POSTING_ID" | head -1 | cut -d'"' -f4)
    
    if [ -z "$POSITION_ID" ]; then
        log_error "No positions found in job posting"
        echo "Response: $JOB_DETAIL"
        return 1
    fi
    
    log_success "Found position: $POSITION_ID"
}

# Test 4: Apply for job (First application)
test_apply_for_job() {
    log_section "TEST 4: Apply for Job (First Application)"
    
    log_info "Candidate applying for job..."
    log_info "Job Posting ID: $JOB_POSTING_ID"
    log_info "Position ID: $POSITION_ID"
    log_info "Candidate ID: $CANDIDATE_ID"
    
    APPLY_RESPONSE=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{
            \"candidate_id\": \"$CANDIDATE_ID\",
            \"job_posting_id\": \"$JOB_POSTING_ID\",
            \"position_id\": \"$POSITION_ID\",
            \"note\": \"First application\"
        }")
    
    APPLICATION_ID=$(echo $APPLY_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    STATUS=$(echo $APPLY_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$APPLICATION_ID" ]; then
        log_error "Failed to apply for job"
        echo "Response: $APPLY_RESPONSE"
        return 1
    fi
    
    log_success "Application created successfully"
    log_info "Application ID: $APPLICATION_ID"
    log_info "Status: $STATUS"
}

# Test 5: Try to apply again (Should fail)
test_duplicate_application_blocked() {
    log_section "TEST 5: Attempt Duplicate Application (Should Fail)"
    
    log_info "Candidate trying to apply for same job again..."
    
    DUPLICATE_RESPONSE=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{
            \"candidate_id\": \"$CANDIDATE_ID\",
            \"job_posting_id\": \"$JOB_POSTING_ID\",
            \"position_id\": \"$POSITION_ID\",
            \"note\": \"Duplicate application attempt\"
        }")
    
    ERROR_MSG=$(echo $DUPLICATE_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    
    if [[ "$ERROR_MSG" == *"already applied"* ]]; then
        log_success "Duplicate application correctly blocked"
        log_info "Error message: $ERROR_MSG"
    else
        log_error "Duplicate application was not blocked!"
        echo "Response: $DUPLICATE_RESPONSE"
        return 1
    fi
}

# Test 6: Withdraw application
test_withdraw_application() {
    log_section "TEST 6: Withdraw Application"
    
    log_info "Candidate withdrawing application..."
    log_info "Application ID: $APPLICATION_ID"
    
    WITHDRAW_RESPONSE=$(curl -s -X POST "$API_URL/applications/$APPLICATION_ID/withdraw" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{
            \"note\": \"Withdrawing application\"
        }")
    
    WITHDRAWN_STATUS=$(echo $WITHDRAW_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    if [ "$WITHDRAWN_STATUS" != "withdrawn" ]; then
        log_error "Failed to withdraw application"
        echo "Response: $WITHDRAW_RESPONSE"
        return 1
    fi
    
    log_success "Application withdrawn successfully"
    log_info "New status: $WITHDRAWN_STATUS"
}

# Test 7: Reapply after withdrawal (Should succeed)
test_reapply_after_withdrawal() {
    log_section "TEST 7: Reapply After Withdrawal (Should Succeed)"
    
    log_info "Candidate reapplying for same job after withdrawal..."
    
    REAPPLY_RESPONSE=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{
            \"candidate_id\": \"$CANDIDATE_ID\",
            \"job_posting_id\": \"$JOB_POSTING_ID\",
            \"position_id\": \"$POSITION_ID\",
            \"note\": \"Reapplication after withdrawal\"
        }")
    
    NEW_APPLICATION_ID=$(echo $REAPPLY_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    NEW_STATUS=$(echo $REAPPLY_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$NEW_APPLICATION_ID" ]; then
        log_error "Failed to reapply after withdrawal"
        echo "Response: $REAPPLY_RESPONSE"
        return 1
    fi
    
    log_success "Reapplication successful"
    log_info "New Application ID: $NEW_APPLICATION_ID"
    log_info "Status: $NEW_STATUS"
    
    # Update APPLICATION_ID for next tests
    APPLICATION_ID=$NEW_APPLICATION_ID
}

# Test 8: Admin shortlist application
test_admin_shortlist() {
    log_section "TEST 8: Admin Shortlist Application"
    
    log_info "Admin shortlisting application..."
    log_info "Application ID: $APPLICATION_ID"
    
    SHORTLIST_RESPONSE=$(curl -s -X POST "$API_URL/applications/$APPLICATION_ID/shortlist" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "{
            \"note\": \"Shortlisted by admin\"
        }")
    
    SHORTLIST_STATUS=$(echo $SHORTLIST_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    if [ "$SHORTLIST_STATUS" != "shortlisted" ]; then
        log_error "Failed to shortlist application"
        echo "Response: $SHORTLIST_RESPONSE"
        return 1
    fi
    
    log_success "Application shortlisted"
    log_info "New status: $SHORTLIST_STATUS"
}

# Test 9: Try to reapply while shortlisted (Should fail)
test_reapply_while_shortlisted_blocked() {
    log_section "TEST 9: Attempt Reapply While Shortlisted (Should Fail)"
    
    log_info "Candidate trying to reapply while application is shortlisted..."
    
    REAPPLY_BLOCKED=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{
            \"candidate_id\": \"$CANDIDATE_ID\",
            \"job_posting_id\": \"$JOB_POSTING_ID\",
            \"position_id\": \"$POSITION_ID\",
            \"note\": \"Reapply while shortlisted\"
        }")
    
    ERROR_MSG=$(echo $REAPPLY_BLOCKED | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    
    if [[ "$ERROR_MSG" == *"already applied"* ]]; then
        log_success "Reapplication correctly blocked while shortlisted"
        log_info "Error message: $ERROR_MSG"
    else
        log_error "Reapplication was not blocked while shortlisted!"
        echo "Response: $REAPPLY_BLOCKED"
        return 1
    fi
}

# Test 10: Admin schedule interview
test_admin_schedule_interview() {
    log_section "TEST 10: Admin Schedule Interview"
    
    log_info "Admin scheduling interview..."
    log_info "Application ID: $APPLICATION_ID"
    
    INTERVIEW_DATE=$(date -u -d "+7 days" +"%Y-%m-%d")
    
    SCHEDULE_RESPONSE=$(curl -s -X POST "$API_URL/applications/$APPLICATION_ID/schedule-interview" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "{
            \"interview_date_ad\": \"$INTERVIEW_DATE\",
            \"interview_time\": \"10:00 AM\",
            \"location\": \"Office\",
            \"contact_person\": \"HR Manager\",
            \"note\": \"Interview scheduled\"
        }")
    
    INTERVIEW_STATUS=$(echo $SCHEDULE_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    INTERVIEW_ID=$(echo $SCHEDULE_RESPONSE | grep -o '"id":"[^"]*' | grep -v "$APPLICATION_ID" | head -1 | cut -d'"' -f4)
    
    if [ "$INTERVIEW_STATUS" != "interview_scheduled" ]; then
        log_error "Failed to schedule interview"
        echo "Response: $SCHEDULE_RESPONSE"
        return 1
    fi
    
    log_success "Interview scheduled"
    log_info "New status: $INTERVIEW_STATUS"
    log_info "Interview ID: $INTERVIEW_ID"
}

# Test 11: Try to reapply while interview scheduled (Should fail)
test_reapply_while_interview_scheduled_blocked() {
    log_section "TEST 11: Attempt Reapply While Interview Scheduled (Should Fail)"
    
    log_info "Candidate trying to reapply while interview is scheduled..."
    
    REAPPLY_BLOCKED=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{
            \"candidate_id\": \"$CANDIDATE_ID\",
            \"job_posting_id\": \"$JOB_POSTING_ID\",
            \"position_id\": \"$POSITION_ID\",
            \"note\": \"Reapply while interview scheduled\"
        }")
    
    ERROR_MSG=$(echo $REAPPLY_BLOCKED | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    
    if [[ "$ERROR_MSG" == *"already applied"* ]]; then
        log_success "Reapplication correctly blocked while interview scheduled"
        log_info "Error message: $ERROR_MSG"
    else
        log_error "Reapplication was not blocked while interview scheduled!"
        echo "Response: $REAPPLY_BLOCKED"
        return 1
    fi
}

# Test 12: Admin mark interview as passed
test_admin_mark_interview_passed() {
    log_section "TEST 12: Admin Mark Interview as Passed"
    
    log_info "Admin marking interview as passed..."
    log_info "Application ID: $APPLICATION_ID"
    
    COMPLETE_RESPONSE=$(curl -s -X POST "$API_URL/applications/$APPLICATION_ID/complete-interview" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "{
            \"result\": \"passed\",
            \"note\": \"Interview passed\"
        }")
    
    FINAL_STATUS=$(echo $COMPLETE_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    if [ "$FINAL_STATUS" != "interview_passed" ]; then
        log_error "Failed to mark interview as passed"
        echo "Response: $COMPLETE_RESPONSE"
        return 1
    fi
    
    log_success "Interview marked as passed"
    log_info "Final status: $FINAL_STATUS"
}

# Test 13: Try to reapply after interview passed (Should fail)
test_reapply_after_interview_passed_blocked() {
    log_section "TEST 13: Attempt Reapply After Interview Passed (Should Fail)"
    
    log_info "Candidate trying to reapply after interview passed..."
    
    REAPPLY_BLOCKED=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{
            \"candidate_id\": \"$CANDIDATE_ID\",
            \"job_posting_id\": \"$JOB_POSTING_ID\",
            \"position_id\": \"$POSITION_ID\",
            \"note\": \"Reapply after interview passed\"
        }")
    
    ERROR_MSG=$(echo $REAPPLY_BLOCKED | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    
    if [[ "$ERROR_MSG" == *"already applied"* ]]; then
        log_success "Reapplication correctly blocked after interview passed"
        log_info "Error message: $ERROR_MSG"
    else
        log_error "Reapplication was not blocked after interview passed!"
        echo "Response: $REAPPLY_BLOCKED"
        return 1
    fi
}

# Test 14: Withdraw final application and reapply
test_final_withdraw_and_reapply() {
    log_section "TEST 14: Final Withdraw and Reapply"
    
    log_info "Candidate withdrawing passed application..."
    
    WITHDRAW_RESPONSE=$(curl -s -X POST "$API_URL/applications/$APPLICATION_ID/withdraw" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{
            \"note\": \"Withdrawing after passing interview\"
        }")
    
    WITHDRAWN_STATUS=$(echo $WITHDRAW_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    if [ "$WITHDRAWN_STATUS" != "withdrawn" ]; then
        log_error "Failed to withdraw passed application"
        echo "Response: $WITHDRAW_RESPONSE"
        return 1
    fi
    
    log_success "Application withdrawn"
    log_info "New status: $WITHDRAWN_STATUS"
    
    log_info "Candidate reapplying after withdrawal..."
    
    FINAL_REAPPLY=$(curl -s -X POST "$API_URL/applications" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -d "{
            \"candidate_id\": \"$CANDIDATE_ID\",
            \"job_posting_id\": \"$JOB_POSTING_ID\",
            \"position_id\": \"$POSITION_ID\",
            \"note\": \"Final reapplication after withdrawal\"
        }")
    
    FINAL_APP_ID=$(echo $FINAL_REAPPLY | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    FINAL_STATUS=$(echo $FINAL_REAPPLY | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$FINAL_APP_ID" ]; then
        log_error "Failed to reapply after withdrawal"
        echo "Response: $FINAL_REAPPLY"
        return 1
    fi
    
    log_success "Final reapplication successful"
    log_info "New Application ID: $FINAL_APP_ID"
    log_info "Status: $FINAL_STATUS"
}

# Main test execution
main() {
    log_section "APPLICATION REAPPLICATION WORKFLOW TEST"
    log_info "API URL: $API_URL"
    log_info "Starting comprehensive test suite..."
    
    # Run all tests
    test_candidate_registration || exit 1
    test_admin_login || exit 1
    test_search_jobs || exit 1
    test_apply_for_job || exit 1
    test_duplicate_application_blocked || exit 1
    test_withdraw_application || exit 1
    test_reapply_after_withdrawal || exit 1
    test_admin_shortlist || exit 1
    test_reapply_while_shortlisted_blocked || exit 1
    test_admin_schedule_interview || exit 1
    test_reapply_while_interview_scheduled_blocked || exit 1
    test_admin_mark_interview_passed || exit 1
    test_reapply_after_interview_passed_blocked || exit 1
    test_final_withdraw_and_reapply || exit 1
    
    # Summary
    log_section "TEST SUITE COMPLETED SUCCESSFULLY"
    log_success "All 14 tests passed!"
    log_info "Reapplication logic is working correctly"
}

# Run main function
main
