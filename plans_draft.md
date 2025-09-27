# Team Work Plan & Reference Guide
## October 6-19, 2024

---

### 📅 Timeline Overview
- **Work Period**: October 6 (Monday) - October 17 (Friday)
- **Weekend**: October 18-19 (Sat-Sun)
- **Team Lead Absence**: October 20-27 (Dashain & Tihar)
- **Resumption & Review**: October 28-29

---

## 🎯 Project Status & Deliverables

### 1. Job Portal (Udaan Saarathi)
**Team Members**: Rojan, Aayush  
**Client**: Udaan Saarathi  

#### Current State
**Mobile App**
- ✅ All written test cases passing
- ✅ Suresh's happy flow implemented
- ✅ Core functionalities working as per test suite

**Web Portal**
- ✅ Separate tester frontend for API integration
- ✅ Multilingual content support
- ✅ Ramesh's flow implementation
- ✅ Dart test runner for E2E test suites

#### Expected Deliverables by Oct 28/29

##### Mobile App (Rojan's Responsibilities)
- [ ] **OTP Page**: Complete behavior implementation
- [ ] **Job Details Page**: 
  - Display complete data from API response
  - Show converted amounts correctly
  - Display all job details comprehensively
- [ ] **Search & Filter**: 
  - Search by job name
  - Search by posting agency
  - Search by employer name
- [ ] **Notifications Page**: Show status transitions
- [ ] **APK Preparation**: 
  - Use Udaan Saarathi logo and branding
  - Build from main branch
  - Test and document any issues
- [ ] **My Applications**: Complete page functionality

##### Web Portal (Aayush's Responsibilities with Ishwor)
- [ ] Complete API integration for:
  - User registration
  - Login functionality
  - Add agency
  - Update agency profile
  - List jobs with search/filter
  - Applicant status updates (per workflow)
- [ ] **Suresh's Flow Implementation**:
  - Register → OTP verify
  - Login → OTP verify
  - Profile CRUD operations
  - Job listings
  - Applicant management

---

### 2. Hostel Management System
**Team Members**: Ishwor, Bhuwan, Sales Team  

#### Priority Tasks
- [ ] Student enrollment form
- [ ] Ledger use cases implementation
- [ ] Package restriction requirements
- [ ] Admin panel for subscription management
- [ ] **API Optimization**: Reduce payload size (shimmer/load time issue)

#### Web Requirements
- [ ] Room/bed layout management

#### Mobile Requirements
- [ ] Booking status display
- [ ] Notifications system
- [ ] Panel login and management

**Note**: Attendance module NOT in current scope unless other priorities are completed first.

---

### 3. Geofence Feature (Kaha App)
**Team Members**: Sabin  

#### Core Functionality
- [ ] Launch business profile on geofence entry
- [ ] Integration with Surya Bros admin panel for polygon drawing
- [ ] "Guide Mode" implementation (switch or dedicated page - pending CEO feedback)

#### Technical Requirements
- [ ] Set up geofence data API server
  - NestJS, Docker, PostgreSQL, TypeORM
  - Port configuration: 5431:5432
  - Dev watch mode with volume mount
- [ ] Database schema:
  - List of coordinates (ordered for polylines)
  - Name, description
  - Entity identifier (preferably entity ID)
  - Read-aloud content
- [ ] CRUD operations for geofence data

#### Expected Behavior
- Standing in front of Kimchi → Opens Kimchi profile
- No intermediate swipe-up screen (reference launcher code from QR implementation)

---

### 4. SOS Panel
**Team Members**: TBD  

#### Requirements
- [ ] API integration in web panel (APIs already built)
- [ ] Display requests from app in panel
- [ ] Status updates functionality
- [ ] Assignment management

**Note**: Mobile app integration already complete (branch hash to be added)

---

### 5. Hotel & Restaurant Module
**Team Members**: Anik (UI), Ishwor (Use cases), CEO  

#### Tasks
- [ ] UI refinement (CEO + Anik)
- [ ] Use case documentation (CEO + Ishwor)
- [ ] Database schema design with justified use cases

---

## 👥 Individual Task Assignments

### Sabin
| Priority | Task | Details | Dependencies |
|----------|------|---------|--------------|
| 1 | Geofence implementation | Launch profile on entry, guide mode | Ishwor for server setup |
| 2 | Hostel API optimization | Reduce payload, make fields nullable | Coordination with Ishwor |
| 3 | Chat UI enhancements | Tap-to-view for shared items (product/room/toilet cards) | CEO reference available |
| 4 | Bug fixes | Handle issues reported by Bhuwan | List from Bhuwan |

### Rojan
| Priority | Task | Details | Status |
|----------|------|---------|--------|
| 1 | Udaan Saarathi APK | Logo, branding, build from main | Ready for demo |
| 2 | Search & Filter | Job name, agency, employer | In progress |
| 3 | My Applications | Complete functionality | Pending |
| 4 | Notifications | Status transitions | Pending |

### Aayush
| Priority | Task | Details | Support |
|----------|------|---------|---------|
| 1 | API Integration training | Learn with Ishwor | Ishwor available |
| 2 | Tester project validation | Ensure test cases pass | With Ishwor |
| 3 | Suresh's flow | Complete implementation | API integration |
| 4 | Profile CRUD | Create, update operations | After basics |

### Ishwor (Support Role)
| Priority | Task | Team Member | Type |
|----------|------|-------------|------|
| 1 | Hostel payload optimization | Sabin | Technical |
| 2 | Geofence server setup | Sabin | Infrastructure |
| 3 | Hostel admin room layout | Bhuwan | Development |
| 4 | API integration | Aayush | Training & Support |
| 5 | Use case documentation | CEO/Anik | Planning |

### CEO (Narayan Dai)
| Activity | With | Purpose |
|----------|------|---------|
| Review geofence progress | Sabin | Mantralaya readiness |
| APK demo review | Rojan | Splash to My Applications flow |
| Web portal review | Aayush/Ishwor | Suresh's flow validation |
| Hotel/Restaurant planning | Anik | Use case definition |
| Attendance module planning | Ishwor | Entity management microservice |

---

## 📋 Client Communication (Udaan Saarathi)

### Demo Points
- ✅ Multilingual support demonstration
- ✅ App screenshots preparation
- ✅ Acknowledge previous feedback:
  - Gunaso reporting (not forgotten)
  - Notification page (included in APK)

### Expectation Management
- No desperate efforts for early completion
- Focus on quality over rushed delivery
- Regular progress updates

---

## 🚨 Important Notes

1. **Ishwor cannot work solo** - Team dependencies must be managed
2. **Weekend (Oct 18-19)** - No office work expected
3. **Oct 28-29** - Reality check and realignment meeting
4. **Documentation** - All progress to be documented for review

---

## ✅ Daily Checklist

### For Team Members
- [ ] Check your priority tasks
- [ ] Coordinate with dependencies
- [ ] Document blockers immediately
- [ ] Update progress in Slack

### For Team Leads
- [ ] Daily standup at regular time
- [ ] Address blockers promptly
- [ ] Ensure cross-team coordination
- [ ] Update this document with any changes

---

## 🔗 Quick References

- **Slack Channel**: [Team coordination link]
- **Test Suite Documentation**: [Link to test cases]
- **API Documentation**: [Link to API docs]
- **Design References**: [CEO's shared references]

---

*Last Updated: September 27, 2024*  
*Document Owner: [Your Name]*  
*For questions during absence (Oct 20-27): Contact CEO or designated team lead*