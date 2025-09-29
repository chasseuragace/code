Absolutely! Based on your detailed “Team Work Plan & Reference Guide,” I can help you create a **focused Udaan Saarathi (Job Portal) project document**. This will be a concise, actionable, and link-ready document specifically for the job portal, structured for quick reference and daily tracking. Here's a draft:

---

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
| **Ishwor**  | Support / API setup      | Assist Aayush with API integration, backend test cases, web flows, payload optimization |

---

## 3. Deliverables & Reference Links

### 3.1 Mobile App (Rojan)

| Feature          | Status      | Reference / File Links                                    |
| ---------------- | ----------- | --------------------------------------------------------- |
| OTP Page         | In Progress | `/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/onboarding/page/`, `API: /register, /verify, /login/start, /login/verify` |
| Job Details Page | In Progress | `/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/jobs/page/job_details_screen.dart`, `API: /jobs/{id}` |
| Search & Filter  | In Progress | `/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/search/page/`, `API: /jobs/search` |
| Notifications    | Pending     | `/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/notifications/page/` |
| My Applications  | Pending     | `/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/applications/page/` |
| APK Build        | Pending     | `/code/variant_dashboard/android/app/build.gradle`, `/code/variant_dashboard/pubspec.yaml` |

**Test Coverage:**

* All existing test cases passing
* Suresh's happy flow implemented
* Dart test runner logs maintained `/code/variant_dashboard/test/`
* Integration tests: `/code/variant_dashboard/integration_test/`

### 3.2 Web Portal (Aayush + Ishwor)

| Feature                   | Status      | Reference / File Links             |
| ------------------------- | ----------- | ---------------------------------- |
| API Integration           | In Progress | `Base URL: https://dev.kaha.com.np/job-portal`, `Swagger: /docs` |
| Registration & Login      | Done        | `/code/src/modules/auth/auth.controller.ts` - `/register`, `/verify`, `/login/start`, `/login/verify` |
| Agency CRUD               | Done        | `/code/src/modules/agency/agency.controller.ts` - `/agencies/owner/agency` |
| Job Listing               | Done        | `/code/src/modules/domain/domain.controller.ts`, `/code/src/modules/domain/public-jobs.controller.ts` |
| Applicant Status Workflow | Done        | `/code/src/modules/application/application.controller.ts` |
| Multilingual Support      | Done        | Mobile app i18n support implemented |
| Ramesh's Flow             | Done        | `/dev_tools/test_web_frontend/tests/` - Complete E2E test suite |

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

* [x] **Git Repository**: `/Users/ajaydahal/portal/agency_research/code/.git` (Main branch)
* [x] **Backend Source**: `/Users/ajaydahal/portal/agency_research/code/src/`
* [x] **Mobile App**: `/Users/ajaydahal/portal/agency_research/code/variant_dashboard/lib/app/udaan_saarathi/`
* [x] **API Documentation**: `https://dev.kaha.com.np/job-portal/docs` (Swagger UI)
* [x] **OpenAPI Spec**: `https://dev.kaha.com.np/job-portal/docs-yaml`
* [x] **Test Suite (Web)**: `/Users/ajaydahal/portal/agency_research/dev_tools/test_web_frontend/tests/`
* [x] **Test Runner Script**: `/Users/ajaydahal/portal/agency_research/dev_tools/test_web_frontend/run.sh`
* [x] **Mobile Tests**: `/Users/ajaydahal/portal/agency_research/code/variant_dashboard/test/`
* [x] **OpenAPI Client Generator**: `/Users/ajaydahal/portal/agency_research/dev_tools/package_form_open_api/build.sh`
* [x] **Sample Data**: `/Users/ajaydahal/portal/agency_research/code/src/resource/sample/`

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

*Document Owner:* Ajay Dahal
*Last Updated:* September 27, 2024 - Updated with actual workspace links
*Workspace Root:* `/Users/ajaydahal/portal/agency_research/code/`

---

If you want, I can **also create a version with all placeholders ready to insert actual file links, endpoints, and branch hashes**, so it becomes a fully actionable “living document” for the team to reference daily.

Do you want me to do that next?
