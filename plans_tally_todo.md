# Udaan Sarathi Backend TODO - Remaining Items
## Based on Original Plan Analysis
### September 29, 2025

---

## 🎯 **Backend Developer Focus Areas**

### **Priority 1: Critical Missing Backend APIs**

#### **1. Notifications System** 🚨
**Original Plan**: "Notifications Page: Show status transitions"
**Backend Requirements**:
- [ ] **Notification Entity & Schema**
  - Notification types (application_status, interview_scheduled, etc.)
  - User targeting (candidate_id, agency_id)
  - Status tracking (sent, read, delivered)
  - Timestamp and expiry management
- [ ] **Notification APIs**
  - `GET /candidates/:id/notifications` - List notifications
  - `PUT /notifications/:id/read` - Mark as read
  - `GET /notifications/unread-count` - Badge count
- [ ] **Status Transition Triggers**
  - Application status changes → notifications
  - Interview scheduling → notifications
  - Job posting updates → notifications
- [ ] **Real-time Integration**
  - WebSocket/SSE for live notifications
  - Push notification infrastructure setup

--- remarks on notificaitons 
- notifications are primarily related to candidates applicaion status 
    - status changes as per application woorkflow rulees 
        - we track application status changes histories when status are changes 
        - we need to prepare templates as per teh workflow stages for the content of ntification 
        - the plan is to haev a dedicated tab under the notificxation page s in the frontend 
            - what the other tabs shall be are not confirmed yet, which is fine as of now as we are planning to work with teh application status change as of now 
                - now then as per the workflow 
                    - applied 
                    - shortlisted 
                    - interview sccheduled 
                    - interview complete (pass / fail )
                        - for this we have notification tracking with previous stage next stage (here next state is the curretn stage after the change )
                        - in the notification we can compose messages with the following thing under context 
                            - job name 
                            - position title 
                            - agency name 
                            - employer name 
                            - tap launch the application detail page 
                                - this shows the job details along with the candidate's  application history timeline 
                        - some stages have some details like for interviwe schedue we nention documents , related information 
                        - we also support rescheduling an interview .
        - i invision hte page shwoing grouped notification for job applicaions 
            - hence here are not much difference wbeteeen the my Application page and the applicaiton workflow notifications , as the only difference is that notification is sent to candidate and notification redirects to the application details page 
                - the applicaitn detail shows all relevant information like we mentioned earlier along with the status change history / the timeline . 
        - so what we can do is intead of handeling notification , we can instead handel 
            -  my applications api 
            - get application details by application id obtained from the my application api 

        - how well begin with this 
            - check existing apis if we have endpoint/ service to list the applicaiton by candidate id 
            - check existing apis for presence of get application details given the applicaion id 
            - make sure that the api's provide ther respective well structured data .
                        

#### **2. Application Management System** 🚨
**Original Plan**: "My Applications: Complete page functionality"
**Backend Requirements**:
- [ ] **Application Status APIs**
  - `GET /candidates/:id/applications` - List all applications
  - `GET /applications/:id/status-history` - Status timeline
  - `PUT /applications/:id/withdraw` - Candidate withdrawal
- [ ] **Status Workflow Engine**
  - Define application status flow (applied → screening → interview → decision)
  - Status validation rules
  - Automated status transitions
- [ ] **Application Analytics**
  - Application statistics per candidate
  - Success rate tracking
  - Interview conversion metrics

#### **3. OTP System Enhancement** 🚨
**Original Plan**: "OTP Page: Complete behavior implementation"
**Backend Requirements**:
- [ ] **OTP Management APIs**
  - Enhanced OTP validation with retry limits
  - OTP expiry handling (currently missing?)
  - Rate limiting for OTP requests
- [ ] **Security Enhancements**
  - Failed attempt tracking
  - Account lockout mechanisms
  - OTP format standardization
- [ ] **Multi-channel OTP**
  - SMS backup for email failures
  - OTP delivery status tracking

---

### **Priority 2: Web Portal Backend Support**

#### **4. Agency Management APIs** 📋
**Original Plan**: "Add agency, Update agency profile, Applicant status updates"
**Backend Requirements**:
- [ ] **Agency Profile Management**
  - `POST /agencies` - Agency registration
  - `PUT /agencies/:id/profile` - Profile updates
  - `GET /agencies/:id/profile` - Profile retrieval
- [ ] **Agency Authentication**
  - Separate auth flow for agencies vs candidates
  - Role-based access control (agency admin, HR, etc.)
- [ ] **Applicant Management for Agencies**
  - `GET /agencies/:id/job-postings/:jobId/applicants` - List applicants
  - `PUT /applications/:id/status` - Update application status
  - `GET /agencies/:id/analytics` - Agency dashboard data

#### **5. Job Posting Management** 📋
**Original Plan**: "List jobs with search/filter, Job listings"
**Backend Requirements**:
- [ ] **Agency Job Management**
  - `POST /agencies/:id/jobs` - Create job posting
  - `PUT /jobs/:id` - Update job posting
  - `DELETE /jobs/:id` - Remove job posting
  - `GET /agencies/:id/jobs` - Agency's job listings
- [ ] **Job Status Management**
  - Active/inactive job status
  - Application deadline handling
  - Auto-expiry mechanisms

---

### **Priority 3: System Enhancements**

#### **6. Interview Management System** 📅
**Original Plan**: Implied by "status transitions" and application workflow
**Backend Requirements**:
- [ ] **Interview Scheduling APIs**
  - `POST /applications/:id/interviews` - Schedule interview
  - `GET /candidates/:id/interviews` - Candidate's interviews
  - `PUT /interviews/:id/reschedule` - Reschedule interview
- [ ] **Interview Status Tracking**
  - Scheduled, completed, cancelled, no-show
  - Interview feedback collection
  - Result recording (pass/fail/pending)

#### **7. Enhanced Search & Analytics** 📊
**Original Plan**: Search functionality (✅ completed, but can be enhanced)
**Backend Requirements**:
- [ ] **Search Analytics**
  - Track popular search terms
  - Job view analytics
  - Application conversion tracking
- [ ] **Advanced Filtering**
  - Salary range optimization
  - Location-based filtering
  - Experience level matching
- [ ] **Recommendation Engine**
  - Job recommendation algorithms
  - Candidate matching for agencies
  - ML-based suggestions

---

### **Priority 4: Production Readiness**

#### **8. Performance & Scalability** ⚡
**Backend Requirements**:
- [ ] **Database Optimization**
  - Index optimization for search queries
  - Query performance monitoring
  - Connection pooling optimization
- [ ] **Caching Strategy**
  - Redis integration for frequently accessed data
  - Job listing caching
  - Search result caching
- [ ] **API Rate Limiting**
  - Implement rate limiting per user/IP
  - API quota management
  - DDoS protection

#### **9. Security & Compliance** 🔒
**Backend Requirements**:
- [ ] **Data Protection**
  - Personal data encryption
  - GDPR compliance measures
  - Data retention policies
- [ ] **API Security**
  - JWT token refresh mechanism
  - API key management for external integrations
  - Input validation enhancement
- [ ] **Audit Logging**
  - User action logging
  - Data access audit trails
  - Security event monitoring

---

## 🚨 **Critical Path Analysis**

### **Must-Have for MVP Launch**
1. **Notifications System** - Essential for user engagement
2. **My Applications** - Core candidate functionality
3. **OTP Enhancement** - Security and user experience
4. **Agency Management** - Required for web portal

### **Should-Have for Beta**
1. **Interview Management** - Complete workflow
2. **Enhanced Search Analytics** - User insights
3. **Performance Optimization** - Scalability

### **Nice-to-Have for V1.0**
1. **Advanced Recommendations** - AI/ML features
2. **Comprehensive Analytics** - Business intelligence
3. **Multi-channel Notifications** - Enhanced UX

---

## 📋 **Implementation Priority Matrix**

| Feature | Backend Effort | Frontend Impact | User Value | Priority |
|---------|---------------|-----------------|------------|----------|
| Notifications API | High | High | Critical | P1 |
| My Applications API | Medium | High | Critical | P1 |
| OTP Enhancement | Low | Medium | High | P1 |
| Agency Management | High | High | High | P2 |
| Interview System | Medium | Medium | High | P2 |
| Search Analytics | Low | Low | Medium | P3 |

---

## 🔄 **Next Sprint Planning**

### **Week 1 Focus**
- [ ] Notifications system design and implementation
- [ ] My Applications API development
- [ ] OTP system enhancement

### **Week 2 Focus**
- [ ] Agency management APIs
- [ ] Interview scheduling system
- [ ] Performance optimization

### **Week 3 Focus**
- [ ] Search analytics implementation
- [ ] Security enhancements
- [ ] Production deployment preparation

---

## 📝 **Technical Debt & Considerations**

### **Database Schema Updates Needed**
- Notifications table structure
- Application status history tracking
- Interview scheduling tables
- Agency profile extensions

### **API Versioning Strategy**
- Plan for backward compatibility
- Version migration strategy
- Documentation updates

### **Testing Requirements**
- E2E tests for new notification flows
- Integration tests for agency workflows
- Performance testing for search enhancements

---

## 🎯 **Success Metrics**

### **Technical KPIs**
- API response time < 200ms for critical endpoints
- 99.9% uptime for notification system
- Zero data loss in application status transitions

### **User Experience KPIs**
- Notification delivery rate > 95%
- Application status update latency < 5 seconds
- Search result relevance score > 80%

---

*Priority Focus: Complete the core user journey from job search → application → status tracking → notifications*

*Next Review: Weekly sprint planning based on completion of P1 items*

*Document Owner: Backend Development Team*
