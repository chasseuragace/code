
# Udaan Saarathi – Job Portal Focus Document

**Timeline:** October 6–17, 2024 (workdays)
**Review & Reality Check:** October 28–29, 2024
**Team Members:** Rojan, Aayush, Ishwor (support)
**Client:** Udaan Saarathi

---

## 1. Project Overview

**Goal:** Ensure the mobile app and web portal are functional, aligned with client expectations, and ready for demo on October 28–29.
**Scope:**

* Mobile app: OTP, job details, search & filter, notifications, my applications.
* Web portal: API integration, agency management, job listing, applicant status workflows.
* Test coverage: All critical flows validated.

---

## 2. Team Responsibilities

| Team Member | Responsibilities         | Notes / Dependencies                                                                    |
| ----------- | ------------------------ | --------------------------------------------------------------------------------------- |
| **Rojan**   | Mobile app (Android/iOS) | OTP page, Job details, Search & filter, Notifications, My Applications, APK preparation |
| **Aayush**  | Web portal integration   | Connect APIs, validate test cases, support mobile backend flows                         |
| **Ishwor**  | Support / API setup      | Assist Aayush,rojan with API integration, backend test cases, web flows, |

---

## 3. Deliverables & Reference Links

### 3.1 Mobile App (Rojan)

| Feature          | Status      | Reference / File Links                                    |
| ---------------- | ----------- | --------------------------------------------------------- |
| OTP Page         | edit entered otp was not cool        | `/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/auth/pages/otp_page.dart`, `API: /register, /verify, /login/start, /login/verify` |
| Job Details Page | make usre that hte salary field is from api, fallback to defaul not availabe        | `/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/job_detail/page/job_details_page.dart`, `API: /jobs/{id}` |
| Search & Filter  | integrate teh search and filter page        | `/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/jobs/page/job_listings_screen.dart`, `API: /jobs/search` |
| Notifications    | get apis from ishwor         | `/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/notifications/page/notification_page.dart` |
| My Applications  | In Progress, api exists check open api sepc/ ishwor | `/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/applicaitons/page/list.dart` (Note: typo in folder name) |
| APK Build        | Pending     | `/code/variant_dashboard/android/app/build.gradle`, `/code/variant_dashboard/pubspec.yaml` |

**Test Coverage:**

* All existing test cases passing
* Suresh's happy flow implemented
* Dart test runner logs maintained `/code/variant_dashboard/test/`
* Integration tests: `/code/variant_dashboard/integration_test/`

### 3.2 Web Portal (Aayush + Ishwor)

| Feature                   | Status      | Reference / File Links             |
| ------------------------- | ----------- | ---------------------------------- |
| API Integration           | To be Done        | `Base URL: https://dev.kaha.com.np/job-portal`, `Swagger: /docs`, `OpenAPI Client: /code/variant_dashboard/lib/app/udaan_saarathi/core/config/api_config.dart` |
| Registration & Login      | To be Done        | `/code/src/modules/auth/auth.controller.ts` - Endpoints: `/register`, `/verify`, `/login/start`, `/login/verify` |
| Agency CRUD               | To be Done        | `/code/src/modules/agency/agency.controller.ts` - Endpoint: `/agencies/owner/agency` |
| Job Listing               | To be Done        | `...docs#/Agencies/AgencyController_listAgencyJobPostings`  |
| Applicant Status Workflow | To be Done , dtos are not available in swagger ,see notes below    | `/code/src/modules/application/application.controller.ts` - Application management |
| Multilingual Support      | Partially done       | Web app i18n support implemented |
| Ramesh's Flow             | To be Done,refer to attached file for what tests are passing   | `/dev_tools/test_web_frontend/tests/` - Complete E2E test suite |

---

## 4. Expected Status on Oct 28–29

* OTP page fully functional
* Job Details page shows complete API data (including converted amounts)
* Search & filter working for job name, agency, employer
* Notifications page shows status transitions correctly
* APK built and ready with Udaan Saarathi branding
* “My Applications” page implemented

### Web Portal (Aayush + Ishwor)

* API integration completed
* Registration/login/agency CRUD working
* Job listing, search/filter functional
* Applicant application status workflow complete

---

## 5. Testing & Validation

* **Mobile App**: Validate each feature against test cases and happy flows
* **Web Portal**: Verify API endpoints using tester project, ensure integration passes Ramesh's flow
* **APK Verification**: Check splash → job listing → notifications → My Applications

---

## 6. Quick Links

* [x] **Git Repository**: `/Volumes/shared_code/code_shared/portal/agency_research/code/.git` (Main branch)
* [x] **Backend Source**: `/Volumes/shared_code/code_shared/portal/agency_research/code/src/`
* [x] **Mobile App**: `/Volumes/shared_code/code_shared/portal/agency_research/code/variant_dashboard/lib/app/udaan_saarathi/`
* [x] **API Documentation**: `https://dev.kaha.com.np/job-portal/docs` (Swagger UI)
* [x] **OpenAPI Spec**: `https://dev.kaha.com.np/job-portal/docs-yaml`
* [x] **Test Suite (Web)**: `/Volumes/shared_code/code_shared/portal/dev_tools/test_web_frontend/tests/`
* [x] **Test Runner Script**: `/Volumes/shared_code/code_shared/portal/dev_tools/test_web_frontend/run.sh`
* [x] **Mobile Tests**: `/Volumes/shared_code/code_shared/portal/agency_research/code/variant_dashboard/test/`
* [x] **OpenAPI Client Generator**: `/Volumes/shared_code/code_shared/portal/dev_tools/package_form_open_api/build.sh`
* [x] **Sample Data**: `/Volumes/shared_code/code_shared/portal/agency_research/code/src/resource/sample/`

---

## 7. Daily Checklist (For Mobile & Web)

* [ ] Review tasks for the day
* [ ] Validate against test cases
* [ ] Update progress in central tracker
* [ ] Report blockers immediately

---

## 8. Notes for Reality Check (Oct 28–29)

* Compare actual app/web portal state vs expected deliverables
* Document gaps and pending items
* Ensure client-ready APK and web portal demo

---
Ishowr : 
- For notification api, we can use the application application status histoy 
    - find all status history for all applications giveen the candidate id, 
    - sory be date 
    rescent activities first.
        -  grouped by application
        - this is applcation history disguised as notifications 
- for workflow apis , teh backend doesnt document he dtos well, however hte test cases , the sure flow , the api's are hit and works fine, refer tot test cases when including dtos. 
[here](/Volumes/shared_code/code_shared/portal/dev_tools/test_web_frontend/tests/application_owner_status_update.test.ts)
