export type paths = {
    "/jobs/seedv1": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["DomainController_seedV1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Search jobs by keyword with filters
         * @description Public endpoint to search jobs using keyword across multiple fields with optional filters and sorting. Supports pagination and includes salary conversions.
         */
        get: operations["PublicJobsController_searchJobs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get public job details by ID
         * @description Retrieve detailed information about a specific job posting including positions, salary conversions, expenses, and interview details.
         */
        get: operations["PublicJobsController_getJobDetails"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/interviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List interviews by candidate IDs, upcoming-first by default */
        get: operations["InterviewsController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/job-titles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List job titles with optional filters */
        get: operations["JobTitleController_listAll"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/job-titles/seedv1": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Seed job titles from src/seed/jobs.seed.json (upsert by title) */
        post: operations["JobTitleController_seedV1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/applications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Apply for a job posting
         * @description Submit a job application for a candidate to a specific job posting. Each candidate can only apply once per job posting.
         */
        post: operations["ApplicationController_apply"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/applications/candidates/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List job applications for a candidate
         * @description Returns a paginated list of job applications submitted by the candidate. By default all statuses are included.
         */
        get: operations["ApplicationController_listForCandidate"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/applications/{id}/shortlist": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ApplicationController_shortlist"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/applications/{id}/schedule-interview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ApplicationController_scheduleInterview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/applications/{id}/reschedule-interview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reschedule an interview
         * @description Updates interview details and changes application status to interview_rescheduled
         */
        post: operations["ApplicationController_rescheduleInterview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/applications/{id}/complete-interview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ApplicationController_completeInterview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/applications/{id}/withdraw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ApplicationController_withdraw"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/applications/{id}/details": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get comprehensive application details
         * @description Returns detailed application information formatted for frontend consumption, including job details, interview info, employer details, and documents.
         */
        get: operations["ApplicationController_getApplicationDetails"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/applications/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get application details by ID
         * @description Returns complete application details including full status change history timeline. Used for "My Applications" detail view and notifications.
         */
        get: operations["ApplicationController_getApplicationById"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/applications/analytics/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get candidate application analytics */
        get: operations["ApplicationController_analytics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get paginated notifications for a candidate
         * @description Retrieve notifications for a specific candidate with pagination and filtering options
         */
        get: operations["NotificationController_getNotifications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/unread-count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get unread notification count
         * @description Get the count of unread notifications for a specific candidate
         */
        get: operations["NotificationController_getUnreadCount"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Mark notification as read
         * @description Mark a specific notification as read by its ID
         */
        patch: operations["NotificationController_markAsRead"];
        trace?: never;
    };
    "/notifications/mark-all-read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Mark all notifications as read
         * @description Mark all notifications as read for a specific candidate
         */
        patch: operations["NotificationController_markAllAsRead"];
        trace?: never;
    };
    "/agencies/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Search agencies with keyword search
         * @description Search across agency name, description, location, and specializations with a single keyword.
         */
        get: operations["AgencyController_searchAgencies"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get agency details by ID
         * @description Returns detailed information about an agency including all profile fields, contact information, and metadata.
         */
        get: operations["AgencyController_getAgencyById"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/license/{license}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get agency details by license number
         * @description Returns detailed information about an agency using their license number.
         */
        get: operations["AgencyController_getAgencyByLicense"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/owner/agency": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get agency owned by the authenticated user */
        get: operations["AgencyController_getMyAgency"];
        put?: never;
        /** Create one agency for the authenticated owner */
        post: operations["AgencyController_createMyAgency"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/owner/agency/basic": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update basic profile information for the authenticated owner agency */
        patch: operations["AgencyController_updateMyAgencyBasic"];
        trace?: never;
    };
    "/agencies/owner/agency/contact": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update contact information for the authenticated owner agency */
        patch: operations["AgencyController_updateMyAgencyContact"];
        trace?: never;
    };
    "/agencies/owner/agency/location": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update location information for the authenticated owner agency */
        patch: operations["AgencyController_updateMyAgencyLocation"];
        trace?: never;
    };
    "/agencies/owner/agency/social-media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update social media links for the authenticated owner agency */
        patch: operations["AgencyController_updateMyAgencySocialMedia"];
        trace?: never;
    };
    "/agencies/owner/agency/services": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update services, specializations, and target countries for the authenticated owner agency */
        patch: operations["AgencyController_updateMyAgencyServices"];
        trace?: never;
    };
    "/agencies/owner/agency/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update settings for the authenticated owner agency */
        patch: operations["AgencyController_updateMyAgencySettings"];
        trace?: never;
    };
    "/agencies/owner/members/invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Invite an agency member and set an admin-managed password */
        post: operations["AgencyController_inviteMember"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/owner/members/{id}/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reset a member password (admin-managed) */
        post: operations["AgencyController_resetMemberPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/owner/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List members of the owner's agency */
        get: operations["AgencyController_listMembers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/owner/members/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a single member details */
        get: operations["AgencyController_getMember"];
        put?: never;
        post?: never;
        /** Delete a member */
        delete: operations["AgencyController_deleteMember"];
        options?: never;
        head?: never;
        /** Update member details */
        patch: operations["AgencyController_updateMember"];
        trace?: never;
    };
    "/agencies/owner/members/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update member status */
        patch: operations["AgencyController_updateMemberStatus"];
        trace?: never;
    };
    "/agencies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AgencyController_createAgency"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AgencyController_getJobPosting"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AgencyController_updateJobPosting"];
        trace?: never;
    };
    "/agencies/{license}/analytics/applicants-by-phase": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AgencyController_getApplicantsByPhase"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/seedv1": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AgencyController_seedV1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/job-postings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List job postings for an agency with filters and analytics */
        get: operations["AgencyController_listAgencyJobPostings"];
        put?: never;
        post: operations["AgencyController_createJobPostingForAgency"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AgencyController_getJobPostingTags"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AgencyController_updateJobPostingTags"];
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}/expenses/medical": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AgencyController_addMedicalExpense"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}/expenses/insurance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AgencyController_addInsuranceExpense"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}/expenses/travel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AgencyController_addTravelExpense"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}/expenses/visa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AgencyController_addVisaExpense"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}/expenses/training": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AgencyController_addTrainingExpense"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}/expenses/welfare": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AgencyController_addWelfareExpense"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}/interview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AgencyController_getInterview"];
        put?: never;
        /**
         * Create interview for a job posting
         * @description Schedules an interview. Requires job_application_id to link interview to a specific candidate application.
         */
        post: operations["AgencyController_createInterview"];
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AgencyController_updateInterview"];
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}/cutout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload job posting cutout image */
        post: operations["AgencyController_uploadCutout"];
        /** Remove job posting cutout image */
        delete: operations["AgencyController_removeCutout"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/job-postings/{id}/toggle-published": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Toggle job posting published status */
        patch: operations["AgencyController_togglePublished"];
        trace?: never;
    };
    "/agencies/{license}/logo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload agency logo */
        post: operations["AgencyController_uploadLogo"];
        /** Remove agency logo */
        delete: operations["AgencyController_deleteLogo"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/banner": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload agency banner */
        post: operations["AgencyController_uploadBanner"];
        /** Remove agency banner */
        delete: operations["AgencyController_deleteBanner"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List reviews for an agency
         * @description Retrieves all reviews for an agency with pagination. Optional candidate_id can be provided to identify the candidate own review in the list.
         */
        get: operations["AgencyReviewController_listReviews"];
        put?: never;
        /**
         * Create a review for an agency
         * @description Allows a candidate to create a review for an agency. Only one review per candidate per agency is allowed.
         */
        post: operations["AgencyReviewController_createReview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/reviews/{reviewId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete a review
         * @description Allows a candidate to delete their own review. Only the review owner can delete.
         */
        delete: operations["AgencyReviewController_deleteReview"];
        options?: never;
        head?: never;
        /**
         * Update a review
         * @description Allows a candidate to update their own review. Only the review owner can update.
         */
        patch: operations["AgencyReviewController_updateReview"];
        trace?: never;
    };
    "/agencies/{license}/jobs/{jobId}/details": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get job details with analytics
         * @description Returns job posting details along with real-time analytics about applications. The tags field contains actual candidate skills (not job tags) for use as filter options.
         */
        get: operations["JobCandidatesController_getJobDetailsWithAnalytics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/jobs/{jobId}/candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get candidates for a job with filtering
         * @description Returns paginated list of candidates who applied to this job, with optional skill filtering and sorting by priority score
         */
        get: operations["JobCandidatesController_getJobCandidates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/jobs/{jobId}/candidates/bulk-shortlist": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Bulk shortlist candidates
         * @description Move multiple candidates from "applied" to "shortlisted" stage in a single operation
         */
        post: operations["JobCandidatesController_bulkShortlist"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/jobs/{jobId}/candidates/available-skills": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get available skills for filtering candidates
         * @description Returns unique skills from candidates who applied to this job. Use these as filter options instead of job tags.
         */
        get: operations["JobCandidatesController_getAvailableSkills"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/jobs/{jobId}/candidates/bulk-reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Bulk reject candidates
         * @description Move multiple candidates to "withdrawn" stage (rejected) in a single operation
         */
        post: operations["JobCandidatesController_bulkReject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/jobs/{jobId}/candidates/bulk-schedule-interview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Bulk schedule interviews for multiple candidates
         * @description Schedule interviews for multiple candidates in a single operation. Only candidates in "shortlisted" stage can be scheduled.
         */
        post: operations["JobCandidatesController_bulkScheduleInterview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/jobs/{jobId}/candidates/{candidateId}/details": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get complete candidate details for a job application
         * @description Returns all candidate information in a single response: profile, job profile, application history, and interview details. Documents are fetched separately.
         */
        get: operations["JobCandidatesController_getCandidateFullDetails"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/jobs/{jobId}/interview-stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get interview statistics for a job
         * @description Returns summary statistics for interviews including counts by status, date, and result. Supports optional date range filtering.
         */
        get: operations["JobCandidatesController_getInterviewStats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/applications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all applications for an agency
         * @description Returns a paginated list of all candidate applications across all job postings owned by the agency.
         *
         *           **Key Features:**
         *           - Optimized data structure to avoid duplication (candidates, jobs, and positions are in separate lookup maps)
         *           - Filter by status, country, job, or position
         *           - Search across candidate names, phones, emails, job titles, and skills
         *           - Priority scoring based on candidate-job match
         *           - Pagination support
         *
         *           **Data Structure:**
         *           - `applications`: Array of application records (just IDs and metadata)
         *           - `candidates`: Lookup map of candidate details (key: candidate_id)
         *           - `jobs`: Lookup map of job details (key: job_posting_id)
         *           - `positions`: Lookup map of position details (key: position_id)
         *
         *           This structure significantly reduces payload size when candidates have applied to multiple positions.
         */
        get: operations["AgencyApplicationsController_getApplications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/applications/countries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get available countries for filtering
         * @description Returns a list of unique countries from all job postings owned by the agency.
         *           Useful for populating country filter dropdowns in the UI.
         */
        get: operations["AgencyApplicationsController_getCountries"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/applications/statistics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get application statistics
         * @description Returns aggregated statistics about applications for the agency:
         *           - Total number of applications
         *           - Breakdown by application status (applied, shortlisted, etc.)
         *           - Breakdown by job country
         *
         *           Useful for dashboard analytics and overview displays.
         */
        get: operations["AgencyApplicationsController_getStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/interviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all interviews for an agency
         * @description Returns interviews across all jobs owned by the agency. Supports filtering by date, search, and interview status.
         */
        get: operations["AgencyInterviewsController_getAllInterviewsForAgency"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agencies/{license}/interviews/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get interview statistics for all agency jobs
         * @description Returns aggregated statistics across all jobs owned by the agency
         */
        get: operations["AgencyInterviewsController_getAgencyInterviewStats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register candidate by phone (OTP flow). Dev returns dev_otp */
        post: operations["AuthController_register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify OTP and return dev token */
        post: operations["AuthController_verify"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/login/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Start login OTP flow */
        post: operations["AuthController_loginStart"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/login/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify login OTP and return token */
        post: operations["AuthController_loginVerify"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agency/register-owner": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register agency owner (phone only). Dev returns dev_otp */
        post: operations["AuthController_registerOwner"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agency/verify-owner": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify owner OTP and return JWT token */
        post: operations["AuthController_verifyOwner"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agency/login/start-owner": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Start login OTP for agency owner */
        post: operations["AuthController_loginStartOwner"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agency/login/verify-owner": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify login OTP for agency owner */
        post: operations["AuthController_loginVerifyOwner"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/member/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Agency member login with phone+password */
        post: operations["AuthController_memberLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/member/login/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Start member login OTP flow */
        post: operations["AuthController_memberLoginStart"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/member/login/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify member login OTP */
        post: operations["AuthController_memberLoginVerify"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/phone-change-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_requestPhoneChange"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/phone-change-verifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_verifyPhoneChange"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get candidate profile by ID */
        get: operations["CandidateController_getCandidateProfile"];
        /** Update candidate profile by ID */
        put: operations["CandidateController_updateCandidateProfile"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/jobs/{jobId}/mobile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get mobile-optimized job details by ID (includes match percentage) */
        get: operations["CandidateController_getJobMobile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create a candidate */
        post: operations["CandidateController_createCandidate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/jobs/{jobId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get job details with candidate-specific fitness score */
        get: operations["CandidateController_getJobDetailsWithFitness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/job-profiles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List candidate job profiles (ordered by updated_at desc) */
        get: operations["CandidateController_listJobProfiles"];
        /** Update the candidate job profile (auto-creates if not exists) */
        put: operations["CandidateController_updateJobProfile"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/relevant-jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List relevant jobs for a candidate (fitness_score included by default) */
        get: operations["CandidateController_getRelevantJobs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/relevant-jobs/grouped": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Relevant jobs grouped by each preferred title (includes fitness_score) */
        get: operations["CandidateController_getRelevantJobsGrouped"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/relevant-jobs/by-title": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Relevant jobs for one preferred title (fitness_score included by default) */
        get: operations["CandidateController_getRelevantJobsByTitle"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/interviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List interviews for a candidate */
        get: operations["CandidateController_listInterviews"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/preferences": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List candidate preferences (id, title, priority) */
        get: operations["CandidateController_listPreferences"];
        put?: never;
        /** Add a preference (validated against active JobTitle) */
        post: operations["CandidateController_addPreference"];
        /** Remove a preference by title (idempotent) */
        delete: operations["CandidateController_removePreference"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/preferences/order": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Reorder preferences by IDs (preferred) or titles */
        put: operations["CandidateController_reorderPreferences"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/profile-image": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload candidate profile image */
        post: operations["CandidateController_uploadProfileImage"];
        /** Remove candidate profile image */
        delete: operations["CandidateController_deleteProfileImage"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all media files for candidate */
        get: operations["CandidateController_listMediaImages"];
        put?: never;
        /** Upload file to candidate media manager (images and documents) */
        post: operations["CandidateController_uploadMediaFile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List candidate documents with slots
         * @description Returns all document types with upload status for the candidate
         */
        get: operations["CandidateController_listDocuments"];
        put?: never;
        /** Upload candidate document */
        post: operations["CandidateController_uploadDocument"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/candidates/{id}/documents/{documentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Remove candidate document */
        delete: operations["CandidateController_deleteDocument"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/document-types": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all document types */
        get: operations["DocumentTypeController_listDocumentTypes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/countries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all countries
         * @description Retrieve a list of all countries with their details
         */
        get: operations["CountryController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/countries/seedv1": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Seed countries
         * @description Seed the database with countries from a JSON file
         */
        post: operations["CountryController_seedV1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/seed/seedSystem": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Seed system with core data
         * @description Idempotently seeds base reference data such as countries, job titles, agencies, and a sample job posting for smoke testing. Safe to run multiple times.
         */
        post: operations["SeedController_seedSystem"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/test-helper/find-test-suite-prerequisites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Find test suite prerequisites for Ramesh workflow */
        get: operations["TesthelperController_findTestSuiteWorkflowPrerequisites"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/test-helper/platform-owner/agencies-analytics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all agencies with owner phone numbers for platform owner */
        get: operations["TesthelperController_getAgenciesAnalytics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/test-helper/candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get paginated list of all candidates (id, phone, name) */
        get: operations["TesthelperController_getCandidates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/jobs/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health check for admin module */
        get: operations["AdminJobsController_healthCheck"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get job listings for admin panel with statistics
         * @description Returns paginated job listings with application statistics, shortlisted counts, and interview counts. Supports filtering by search term, country, and agency. Supports sorting by published date, applications, shortlisted, or interviews.
         */
        get: operations["AdminJobsController_getAdminJobs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/jobs/statistics/countries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get job distribution by country
         * @description Returns the count of jobs per country. Can be filtered by agency ID to show only countries where a specific agency has jobs.
         */
        get: operations["AdminJobsController_getCountryDistribution"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
};
export type webhooks = Record<string, never>;
export type components = {
    schemas: {
        EmployerLiteDto: {
            /** @description Id */
            id: string;
            /** @description Company name */
            company_name: string;
            /** @description Country */
            country: string;
            /**
             * @description City
             * @example Dubai
             */
            city?: string | null;
        };
        AgencyLiteDto: {
            /** @description Id */
            id: string;
            /** @description Name */
            name: string;
            /** @description License number */
            license_number: string;
            /** @description Phones */
            phones?: string[] | null;
            /** @description Emails */
            emails?: string[] | null;
            /** @description Website */
            website?: string | null;
        };
        VacancyDto: {
            /** @description Male */
            male?: Record<string, never> | null;
            /** @description Female */
            female?: Record<string, never> | null;
            /** @description Total */
            total?: Record<string, never> | null;
        };
        SalaryConvDto: {
            /**
             * @description Amount
             * @example 0
             */
            amount: number;
            /**
             * @description Currency
             * @example example
             */
            currency: string;
        };
        PositionSalaryDto: {
            /**
             * @description Monthly amount
             * @example 0
             */
            monthly_amount: number;
            /**
             * @description Currency
             * @example example
             */
            currency: string;
            /** @description Converted */
            converted?: components["schemas"]["SalaryConvDto"][];
        };
        PositionOverridesDto: {
            /** @description Hours per day */
            hours_per_day?: Record<string, never> | null;
            /** @description Days per week */
            days_per_week?: Record<string, never> | null;
            /** @description Overtime policy */
            overtime_policy?: Record<string, never> | null;
            /** @description Weekly off days */
            weekly_off_days?: Record<string, never> | null;
            /** @description Food */
            food?: Record<string, never> | null;
            /** @description Accommodation */
            accommodation?: Record<string, never> | null;
            /** @description Transport */
            transport?: Record<string, never> | null;
        };
        PositionDto: {
            /**
             * @description Title
             * @example example
             */
            title: string;
            /** @description Vacancies */
            vacancies: components["schemas"]["VacancyDto"];
            /** @description Salary */
            salary: components["schemas"]["PositionSalaryDto"];
            /** @description Overrides */
            overrides: components["schemas"]["PositionOverridesDto"];
        };
        JobSearchItemDto: {
            /**
             * @description Job posting ID
             * @example uuid-v4-string
             */
            id: string;
            /**
             * @description Job posting title
             * @example Senior Electrical Technician - Dubai Project
             */
            posting_title: string;
            /**
             * @description Country
             * @example UAE
             */
            country: string;
            /**
             * @description City
             * @example Dubai
             */
            city?: Record<string, never> | null;
            /**
             * @description Posting date
             * @example 2024-01-15T10:30:00Z
             */
            posting_date_ad?: Record<string, never> | null;
            /** @description Employer */
            employer?: components["schemas"]["EmployerLiteDto"] | null;
            /** @description Agency */
            agency?: components["schemas"]["AgencyLiteDto"] | null;
            /** @description Available positions with salary and vacancy information */
            positions: components["schemas"]["PositionDto"][];
        };
        JobSearchFiltersDto: {
            /** @description Country filter applied */
            country?: Record<string, never> | null;
            /** @description Minimum salary filter applied */
            min_salary?: Record<string, never> | null;
            /** @description Maximum salary filter applied */
            max_salary?: Record<string, never> | null;
            /** @description Currency filter applied */
            currency?: Record<string, never> | null;
        };
        JobSearchMetaDto: {
            /** @description Search keyword used */
            keyword?: Record<string, never> | null;
            /** @description Filters applied to the search */
            filters: components["schemas"]["JobSearchFiltersDto"];
        };
        JobSearchResponseDto: {
            /** @description Array of job search results */
            data: components["schemas"]["JobSearchItemDto"][];
            /**
             * @description Total number of jobs matching the search criteria
             * @example 42
             */
            total: number;
            /**
             * @description Current page number
             * @example 1
             */
            page: number;
            /**
             * @description Number of items per page
             * @example 10
             */
            limit: number;
            /** @description Search metadata including keyword and filters applied */
            search: components["schemas"]["JobSearchMetaDto"];
        };
        ContractDto: {
            /** @description Period years */
            period_years?: Record<string, never> | null;
            /** @description Renewable */
            renewable?: Record<string, never> | null;
            /** @description Hours per day */
            hours_per_day?: Record<string, never> | null;
            /** @description Days per week */
            days_per_week?: Record<string, never> | null;
            /** @description Overtime policy */
            overtime_policy?: Record<string, never> | null;
            /** @description Weekly off days */
            weekly_off_days?: Record<string, never> | null;
            /** @description Food */
            food?: Record<string, never> | null;
            /** @description Accommodation */
            accommodation?: Record<string, never> | null;
            /** @description Transport */
            transport?: Record<string, never> | null;
            /** @description Annual leave days */
            annual_leave_days?: Record<string, never> | null;
        };
        ExpensesDto: {
            /** @description Medical */
            medical?: Record<string, never>[];
            /** @description Insurance */
            insurance?: Record<string, never>[];
            /** @description Travel */
            travel?: Record<string, never>[];
            /** @description Visa permit */
            visa_permit?: Record<string, never>[];
            /** @description Training */
            training?: Record<string, never>[];
            /** @description Welfare service */
            welfare_service?: Record<string, never>[];
        };
        JobDetailsDto: {
            /**
             * @description Id
             * @example example
             */
            id: string;
            /**
             * @description Posting title
             * @example example
             */
            posting_title: string;
            /**
             * @description Country
             * @example example
             */
            country: string;
            /** @description City */
            city?: Record<string, never> | null;
            /** @description Announcement type */
            announcement_type?: Record<string, never> | null;
            /** @description Posting date ad */
            posting_date_ad?: Record<string, never> | null;
            /** @description Notes */
            notes?: Record<string, never> | null;
            /** @description Agency */
            agency?: components["schemas"]["AgencyLiteDto"] | null;
            /** @description Employer */
            employer?: components["schemas"]["EmployerLiteDto"] | null;
            /** @description Contract */
            contract?: components["schemas"]["ContractDto"] | null;
            /** @description Positions */
            positions: components["schemas"]["PositionDto"][];
            /** @description Skills */
            skills?: string[];
            /** @description Education requirements */
            education_requirements?: string[];
            /** @description Experience requirements */
            experience_requirements?: Record<string, never> | null;
            /** @description Canonical titles */
            canonical_titles?: string[];
            /** @description Expenses */
            expenses?: components["schemas"]["ExpensesDto"];
            /** @description Interview */
            interview?: Record<string, never> | null;
            /** @description Cutout url */
            cutout_url?: Record<string, never> | null;
        };
        InterviewScheduleDto: {
            /**
             * Format: date
             * @description AD date (ISO string yyyy-mm-dd)
             */
            date_ad?: string | null;
            /** @description BS date (yyyy-mm-dd in BS) */
            date_bs?: string | null;
            /** @description Time (HH:MM[:SS]) */
            time?: string | null;
        };
        ApplicationLiteDto: {
            /** @description Id */
            id: string;
            /** @description Status */
            status: string;
        };
        PostingLiteDto: {
            /** @description Id */
            id: string;
            /** @description Posting title */
            posting_title: string;
            /** @description Country */
            country: string;
            /**
             * @description City
             * @example Kathmandu
             */
            city?: string | null;
        };
        InterviewExpenseDto: {
            /**
             * @description Expense type
             * @example example
             */
            expense_type: string;
            /**
             * @description Who pays
             * @example example
             */
            who_pays: string;
            /**
             * @description Is free
             * @example true
             */
            is_free: boolean;
            /** @description Amount */
            amount?: number;
            /** @description Currency */
            currency?: string;
            /**
             * @description Refundable
             * @example true
             */
            refundable: boolean;
            /** @description Notes */
            notes?: string;
        };
        InterviewEnrichedDto: {
            /** @description Id */
            id: string;
            /** @description Schedule */
            schedule: components["schemas"]["InterviewScheduleDto"];
            /** @description Location */
            location?: string | null;
            /** @description Contact person */
            contact_person?: string | null;
            /** @description Required documents */
            required_documents?: string[] | null;
            /** @description Notes */
            notes?: string | null;
            /** @description Application */
            application?: components["schemas"]["ApplicationLiteDto"] | null;
            /** @description Posting */
            posting: components["schemas"]["PostingLiteDto"];
            /** @description Agency */
            agency: components["schemas"]["AgencyLiteDto"];
            /** @description Employer */
            employer: components["schemas"]["EmployerLiteDto"];
            /** @description Expenses */
            expenses: components["schemas"]["InterviewExpenseDto"][];
        };
        PaginatedInterviewsDto: {
            /** @description Page */
            page: number;
            /** @description Limit */
            limit: number;
            /** @description Total */
            total: number;
            /** @description Items */
            items: components["schemas"]["InterviewEnrichedDto"][];
        };
        JobTitleDto: {
            /**
             * @description Id
             * @example example
             */
            id: string;
            /**
             * @description Title
             * @example example
             */
            title: string;
            /**
             * @description Rank
             * @example 0
             */
            rank: number;
            /**
             * @description Is active
             * @example true
             */
            is_active: boolean;
            /** @description Difficulty */
            difficulty?: Record<string, never> | null;
            /** @description Skills summary */
            skills_summary?: Record<string, never> | null;
            /** @description Description */
            description?: Record<string, never> | null;
        };
        JobTitleListResponseDto: {
            /** @description Data */
            data: components["schemas"]["JobTitleDto"][];
            /**
             * @description Total
             * @example 10
             */
            total: number;
        };
        JobTitleSeedResponseDto: {
            /**
             * @description Source
             * @example example
             */
            source: string;
            /**
             * @description Upserted
             * @example 0
             */
            upserted: number;
        };
        ApplyJobDto: {
            /**
             * Format: uuid
             * @description UUID of the candidate applying for the job
             * @example 7103d484-19b0-4c62-ae96-256da67a49a4
             */
            candidate_id: string;
            /**
             * Format: uuid
             * @description UUID of the job posting to apply for
             * @example 1e8c9c1a-352c-485d-ac9a-767cbbca4a4c
             */
            job_posting_id: string;
            /**
             * Format: uuid
             * @description UUID of the specific position being applied for within the job posting
             * @example 2f4a8d3b-1c5e-4f7a-9d2c-8e3f6a5b4d7e
             */
            position_id: string;
            /**
             * @description Optional note or cover letter from the candidate
             * @example I am very interested in this electrical position and have 5 years of experience.
             */
            note?: string;
            /**
             * @description Optional field to track who created this application (for audit purposes)
             * @example candidate-mobile-app
             */
            updatedBy?: string;
        };
        ApplyJobResponseDto: {
            /**
             * Format: uuid
             * @description UUID of the created job application
             * @example 075ce7d9-fcdb-4f7e-b794-4190f49d729f
             */
            id: string;
            /**
             * @description Current status of the application
             * @example applied
             * @enum {string}
             */
            status: "applied" | "shortlisted" | "interview_scheduled" | "interview_completed" | "selected" | "rejected" | "withdrawn";
        };
        EmployerDto: {
            /**
             * @description Company name
             * @example ABC Corporation
             */
            company_name: string;
            /**
             * @description Country of the employer
             * @example United Arab Emirates
             */
            country: string;
            /**
             * @description City of the employer
             * @example Dubai
             */
            city?: string;
        };
        JobPostingDto: {
            /**
             * @description Job title
             * @example Senior Electrician
             */
            title: string;
            /** @description Employer details */
            employer: components["schemas"]["EmployerDto"];
            /**
             * @description Country of the job
             * @example United Arab Emirates
             */
            country: string;
            /**
             * @description City of the job
             * @example Dubai
             */
            city?: string;
        };
        PositionDetailsDto: {
            /**
             * Format: uuid
             * @description Position ID
             * @example 2f4a8d3b-1c5e-4f7a-9d2c-8e3f6a5b4d7e
             */
            id: string;
            /**
             * @description Title of the position
             * @example Senior Electrician
             */
            title: string;
            /**
             * @description Number of vacancies available for this position
             * @example 5
             */
            vacancies: number;
            /**
             * @description Salary range for this position
             * @example 3000-4000 USD
             */
            salary_range?: string;
            /**
             * @description Experience required for this position
             * @example 5+ years
             */
            experience_required?: string;
            /**
             * @description Skills required for this position
             * @example [
             *       "Electrical Wiring",
             *       "Maintenance",
             *       "Troubleshooting"
             *     ]
             */
            skills_required?: string[];
        };
        InterviewDetailsDto: {
            /**
             * @description Interview ID
             * @example 123e4567-e89b-12d3-a456-426614174000
             */
            id: string;
            /**
             * Format: date-time
             * @description Interview date (AD)
             * @example 2025-10-30T00:00:00.000Z
             */
            interview_date_ad?: string;
            /**
             * @description Interview date (BS)
             * @example 2082-07-13
             */
            interview_date_bs?: string;
            /**
             * @description Interview time
             * @example 14:30
             */
            interview_time?: string;
            /** @description Interview location */
            location?: string;
            /** @description Contact person for the interview */
            contact_person?: string;
            /** @description List of required documents */
            required_documents?: string[];
            /** @description Additional notes */
            notes?: string;
            /** @description List of interview expenses */
            expenses?: components["schemas"]["InterviewExpenseDto"][];
        };
        JobApplicationListItemDto: {
            /**
             * @description Job application UUID
             * @example 075ce7d9-fcdb-4f7e-b794-4190f49d729f
             */
            id: string;
            /**
             * @description Candidate UUID the application belongs to
             * @example 7103d484-19b0-4c62-ae96-256da67a49a4
             */
            candidate_id: string;
            /**
             * @description Job posting UUID the application targets
             * @example 1e8c9c1a-352c-485d-ac9a-767cbbca4a4c
             */
            job_posting_id: string;
            /** @description Job posting details */
            job_posting?: components["schemas"]["JobPostingDto"];
            /** @description Details about the specific position applied for */
            position?: components["schemas"]["PositionDetailsDto"];
            /**
             * @description Current status within the application workflow
             * @example shortlisted
             * @enum {string}
             */
            status: "applied" | "shortlisted" | "interview_scheduled" | "interview_rescheduled" | "interview_passed" | "interview_failed" | "withdrawn";
            /**
             * @description Name of the agency handling the job posting
             * @example ABC Recruitment
             */
            agency_name?: Record<string, never>;
            /** @description Interview details (only included if status is interview_scheduled or interview_rescheduled) */
            interview?: components["schemas"]["InterviewDetailsDto"];
            /**
             * Format: date-time
             * @description Date the application was created
             * @example 2025-09-21T10:30:00.000Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @description Date the application was last updated
             * @example 2025-09-22T08:10:00.000Z
             */
            updated_at: string;
        };
        PaginatedJobApplicationsDto: {
            /** @description Current page of job applications */
            items: components["schemas"]["JobApplicationListItemDto"][];
            /**
             * @description Total number of applications matching the filter
             * @example 5
             */
            total: number;
            /**
             * @description Current page number (1-based)
             * @example 1
             */
            page: number;
            /**
             * @description Number of items per page
             * @example 20
             */
            limit: number;
        };
        EmployerDetailsDto: {
            /**
             * @description Company name
             * @example Al Futtaim Group
             */
            name: string;
            /**
             * @description Country
             * @example UAE
             */
            country: string;
            /**
             * @description Agency name
             * @example Brightway Manpower Pvt. Ltd.
             */
            agency: string;
            /**
             * @description Government license number
             * @example Govt. License No. 1234/067/68
             */
            license: string;
            /**
             * @description Agency phone number
             * @example +977 9812345678
             */
            agencyPhone: string;
            /**
             * @description Agency email
             * @example info@brightway.com
             */
            agencyEmail: string;
            /**
             * @description Agency address
             * @example Maitidevi, Kathmandu
             */
            agencyAddress: string;
        };
        DocumentDto: {
            /**
             * @description Document name
             * @example CV.pdf
             */
            name: string;
            /**
             * @description Document size
             * @example 245 KB
             */
            size: string;
        };
        ApplicationDetailsDto: {
            /**
             * @description Application ID
             * @example APP2025-00123
             */
            id: string;
            /**
             * @description Date when application was submitted
             * @example 12 Sept 2025
             */
            appliedOn: string;
            /**
             * @description Date when application was last updated
             * @example 20 Sept 2025
             */
            lastUpdated: string;
            /**
             * @description Current application status
             * @example Interview Scheduled
             * @enum {string}
             */
            status: "Applied" | "Shortlisted" | "Interview Scheduled" | "Interview Rescheduled" | "Interview Passed" | "Interview Failed" | "Withdrawn";
            /**
             * @description Application remarks/notes
             * @example Documents verified, waiting for interview confirmation
             */
            remarks: string;
            /**
             * @description Application progress (0-5)
             * @example 2
             */
            progress: number;
            /** @description Job details */
            job: components["schemas"]["JobDetailsDto"];
            /** @description Interview details */
            interview?: components["schemas"]["InterviewDetailsDto"];
            /** @description Employer details */
            employer: components["schemas"]["EmployerDetailsDto"];
            /** @description Application documents */
            documents: components["schemas"]["DocumentDto"][];
        };
        ApplicationDetailDto: {
            /**
             * Format: uuid
             * @description UUID of the application
             * @example 075ce7d9-fcdb-4f7e-b794-4190f49d729f
             */
            id: string;
            /**
             * Format: uuid
             * @description UUID of the candidate
             * @example 7103d484-19b0-4c62-ae96-256da67a49a4
             */
            candidate_id: string;
            /**
             * Format: uuid
             * @description UUID of the job posting
             * @example 1e8c9c1a-352c-485d-ac9a-767cbbca4a4c
             */
            job_posting_id: string;
            /**
             * @description Current status of the application
             * @example interview_scheduled
             * @enum {string}
             */
            status: "applied" | "shortlisted" | "interview_scheduled" | "interview_rescheduled" | "interview_passed" | "interview_failed" | "withdrawn";
            /**
             * @description Complete history of status changes in chronological order
             * @example [
             *       {
             *         "prev_status": null,
             *         "next_status": "applied",
             *         "updated_at": "2025-09-20T10:00:00Z",
             *         "updated_by": "candidate-mobile-app",
             *         "note": "Initial application"
             *       },
             *       {
             *         "prev_status": "applied",
             *         "next_status": "shortlisted",
             *         "updated_at": "2025-09-22T14:30:00Z",
             *         "updated_by": "agency-staff-123",
             *         "note": "Good qualifications"
             *       }
             *     ]
             */
            history_blob: {
                prev_status?: string | null;
                next_status?: string;
                /** Format: date-time */
                updated_at?: string;
                updated_by?: string | null;
                note?: string | null;
                corrected?: boolean | null;
            }[];
            /**
             * Format: date-time
             * @description Timestamp when application was withdrawn (null if not withdrawn)
             * @example null
             */
            withdrawn_at: string | null;
            /**
             * Format: date-time
             * @description Timestamp when application was created
             * @example 2025-09-20T10:00:00Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @description Timestamp when application was last updated
             * @example 2025-09-22T14:30:00Z
             */
            updated_at: string;
        };
        ApplicationAnalyticsDto: {
            /** @description Total number of applications created by the candidate */
            total: number;
            /** @description Number of active applications (non-terminal statuses) */
            active: number;
            /**
             * @description Counts per status for all workflow stages
             * @example {
             *       "applied": 1,
             *       "shortlisted": 0,
             *       "interview_scheduled": 0,
             *       "interview_rescheduled": 0,
             *       "interview_passed": 0,
             *       "interview_failed": 0,
             *       "withdrawn": 0
             *     }
             */
            by_status: {
                [key: string]: number;
            };
        };
        NotificationResponseDto: {
            /**
             * @description Unique identifier of the notification
             * @example f47ac10b-58cc-4372-a567-0e02b2c3d479
             */
            id: string;
            /**
             * @description UUID of the candidate who received the notification
             * @example f47ac10b-58cc-4372-a567-0e02b2c3d479
             */
            candidate_id: string;
            /**
             * @description UUID of the related job application
             * @example f47ac10b-58cc-4372-a567-0e02b2c3d479
             */
            job_application_id: string;
            /**
             * @description UUID of the related job posting
             * @example f47ac10b-58cc-4372-a567-0e02b2c3d479
             */
            job_posting_id: string;
            /**
             * @description UUID of the related agency
             * @example f47ac10b-58cc-4372-a567-0e02b2c3d479
             */
            agency_id: string;
            /**
             * @description UUID of the related interview (if applicable)
             * @example f47ac10b-58cc-4372-a567-0e02b2c3d479
             */
            interview_id?: string;
            /**
             * @description Type of notification
             * @example shortlisted
             * @enum {string}
             */
            notification_type: "shortlisted" | "interview_scheduled" | "interview_rescheduled" | "interview_passed" | "interview_failed";
            /**
             * @description Notification title
             * @example Congratulations! You've been shortlisted
             */
            title: string;
            /**
             * @description Notification message content
             * @example Congratulations! You have been shortlisted for "Software Engineer" at Tech Company Ltd.
             */
            message: string;
            /**
             * @description Additional notification data
             * @example {
             *       "job_title": "Software Engineer",
             *       "agency_name": "Tech Company Ltd.",
             *       "interview_details": {
             *         "date": "2025-01-15",
             *         "time": "10:00",
             *         "location": "Company Office"
             *       }
             *     }
             */
            payload: Record<string, never>;
            /**
             * @description Whether the notification has been read
             * @example false
             */
            is_read: boolean;
            /**
             * @description Whether the notification has been sent via push
             * @example true
             */
            is_sent: boolean;
            /**
             * Format: date-time
             * @description Timestamp when the notification was sent
             * @example 2025-01-01T10:00:00.000Z
             */
            sent_at?: string;
            /**
             * Format: date-time
             * @description Timestamp when the notification was read
             * @example 2025-01-01T10:30:00.000Z
             */
            read_at?: string;
            /**
             * Format: date-time
             * @description Timestamp when the notification was created
             * @example 2025-01-01T10:00:00.000Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @description Timestamp when the notification was last updated
             * @example 2025-01-01T10:00:00.000Z
             */
            updated_at: string;
        };
        NotificationListResponseDto: {
            /** @description Array of notification items */
            items: components["schemas"]["NotificationResponseDto"][];
            /**
             * @description Total number of notifications
             * @example 25
             */
            total: number;
            /**
             * @description Current page number
             * @example 1
             */
            page: number;
            /**
             * @description Number of items per page
             * @example 20
             */
            limit: number;
            /**
             * @description Number of unread notifications
             * @example 5
             */
            unreadCount: number;
        };
        MarkAsReadResponseDto: {
            /**
             * @description Whether the operation was successful
             * @example true
             */
            success: boolean;
            /** @description The updated notification (if found) */
            notification?: components["schemas"]["NotificationResponseDto"];
            /**
             * @description Response message
             * @example Notification marked as read
             */
            message: string;
        };
        MarkAllAsReadResponseDto: {
            /**
             * @description Whether the operation was successful
             * @example true
             */
            success: boolean;
            /**
             * @description Number of notifications marked as read
             * @example 5
             */
            markedCount: number;
            /**
             * @description Response message
             * @example 5 notifications marked as read
             */
            message: string;
        };
        AgencyCardDto: {
            /** @description Unique identifier of the agency */
            id: string;
            /** @description Name of the agency */
            name: string;
            /** @description License number of the agency */
            license_number: string;
            /** @description URL to the agency logo */
            logo_url?: string;
            /** @description Brief description of the agency */
            description?: string;
            /** @description City where the agency is located */
            city?: Record<string, never>;
            /** @description Country where the agency is located */
            country?: Record<string, never>;
            /** @description Agency website URL */
            website?: string;
            /**
             * @description Whether the agency is active
             * @default true
             */
            is_active: boolean;
            /**
             * @description Date and time when the agency was created
             * @example 2023-10-31T12:00:00.000Z
             */
            created_at: string;
            /**
             * @description Number of job postings associated with this agency
             * @example 0
             */
            job_posting_count: number;
            /** @description List of specializations */
            specializations?: string[];
        };
        PaginatedAgencyResponseDto: {
            /** @description List of agencies matching the search criteria */
            data: components["schemas"]["AgencyCardDto"][];
            /** @description Pagination metadata */
            meta: {
                /** @description Total number of items */
                total?: number;
                /** @description Current page number */
                page?: number;
                /** @description Number of items per page */
                limit?: number;
                /** @description Total number of pages */
                totalPages?: number;
            };
        };
        CertificationDto: {
            /**
             * @description Name
             * @example Example Name
             */
            name?: string;
            /**
             * @description Number
             * @example example
             */
            number?: string;
            /**
             * @description Issued by
             * @example example
             */
            issued_by?: string;
            /** @description ISO date string (YYYY-MM-DD) */
            issued_date?: string;
            /** @description ISO date string (YYYY-MM-DD) */
            expiry_date?: string;
        };
        SocialMediaDto: {
            /**
             * @description Facebook
             * @example example
             */
            facebook?: string;
            /**
             * @description Instagram
             * @example example
             */
            instagram?: string;
            /**
             * @description Linkedin
             * @example https://example.com
             */
            linkedin?: string;
            /**
             * @description Twitter
             * @example example
             */
            twitter?: string;
        };
        BankDetailsDto: {
            /**
             * @description Bank name
             * @example Example Name
             */
            bank_name?: string;
            /**
             * @description Account name
             * @example Example Name
             */
            account_name?: string;
            /**
             * @description Account number
             * @example example
             */
            account_number?: string;
            /**
             * @description Swift code
             * @example example
             */
            swift_code?: string;
        };
        ContactPersonDto: {
            /**
             * @description Name
             * @example Example Name
             */
            name?: string;
            /**
             * @description Position
             * @example example
             */
            position?: string;
            /**
             * @description Phone
             * @example +1234567890
             */
            phone?: string;
            /**
             * @description Email
             * @example user@example.com
             */
            email?: string;
        };
        OperatingHoursDto: {
            /**
             * @description Weekdays
             * @example example
             */
            weekdays?: string;
            /**
             * @description Saturday
             * @example example
             */
            saturday?: string;
            /**
             * @description Sunday
             * @example example
             */
            sunday?: string;
        };
        StatisticsDto: {
            /**
             * @description Total placements
             * @example 10
             */
            total_placements?: number;
            /** @description ISO date string (YYYY-MM-DD) */
            active_since?: string;
            /**
             * @description Success rate
             * @example 0
             */
            success_rate?: number;
            /**
             * @description Countries served
             * @example 10
             */
            countries_served?: number;
            /**
             * @description Partner companies
             * @example 0
             */
            partner_companies?: number;
            /**
             * @description Active recruiters
             * @example 0
             */
            active_recruiters?: number;
        };
        SettingsDto: {
            /**
             * @description Currency
             * @example example
             */
            currency?: string;
            /**
             * @description Timezone
             * @example example
             */
            timezone?: string;
            /**
             * @description Language
             * @example example
             */
            language?: string;
            /**
             * @description Date format
             * @example example
             */
            date_format?: string;
            /** @description Notifications */
            notifications?: Record<string, never>;
            /** @description Features */
            features?: Record<string, never>;
        };
        AgencyResponseDto: {
            /**
             * @description Id
             * @example example
             */
            id: string;
            /**
             * @description Name
             * @example Example Name
             */
            name: string;
            /**
             * @description License number
             * @example example
             */
            license_number: string;
            /**
             * @description Address
             * @example example
             */
            address?: string;
            /** @description Latitude */
            latitude?: number | null;
            /** @description Longitude */
            longitude?: number | null;
            /** @description Phones */
            phones?: string[];
            /** @description Emails */
            emails?: string[];
            /**
             * @description Website
             * @example example
             */
            website?: string;
            /**
             * @description Description
             * @example example
             */
            description?: string;
            /**
             * @description Logo url
             * @example https://example.com
             */
            logo_url?: string;
            /** @description Banner url */
            banner_url?: string | null;
            /** @description Established year */
            established_year?: number | null;
            /** @description Services */
            services?: string[];
            /** @description Certifications */
            certifications?: components["schemas"]["CertificationDto"][];
            /** @description Social media */
            social_media?: components["schemas"]["SocialMediaDto"];
            /** @description Bank details */
            bank_details?: components["schemas"]["BankDetailsDto"];
            /** @description Contact persons */
            contact_persons?: components["schemas"]["ContactPersonDto"][];
            /** @description Operating hours */
            operating_hours?: components["schemas"]["OperatingHoursDto"];
            /** @description Target countries */
            target_countries?: string[];
            /** @description Specializations */
            specializations?: string[];
            /** @description Statistics */
            statistics?: components["schemas"]["StatisticsDto"];
            /**
             * @description Settings
             * @example {
             *       "currency": "USD",
             *       "timezone": "UTC",
             *       "language": "en",
             *       "date_format": "YYYY-MM-DD",
             *       "notifications": {
             *         "email": true,
             *         "push": true
             *       },
             *       "features": {
             *         "darkMode": true,
             *         "notifications": true
             *       }
             *     }
             */
            settings?: components["schemas"]["SettingsDto"] | null;
        };
        CreateAgencyDto: {
            /**
             * @description Name
             * @example Example Name
             */
            name: string;
            /** @description Unique license number for the agency */
            license_number: string;
            /**
             * @description Country
             * @example example
             */
            country?: string;
            /**
             * @description City
             * @example example
             */
            city?: string;
            /**
             * @description Address
             * @example example
             */
            address?: string;
            /**
             * @description Latitude
             * @example 0
             */
            latitude?: number;
            /**
             * @description Longitude
             * @example 0
             */
            longitude?: number;
            /** @description Phones */
            phones?: string[];
            /** @description Emails */
            emails?: string[];
            /**
             * @description Contact email
             * @example user@example.com
             */
            contact_email?: string;
            /**
             * @description Contact phone
             * @example +1234567890
             */
            contact_phone?: string;
            /**
             * @description Website
             * @example example
             */
            website?: string;
            /**
             * @description Description
             * @example example
             */
            description?: string;
            /**
             * @description Logo url
             * @example https://example.com
             */
            logo_url?: string;
            /**
             * @description Banner url
             * @example https://example.com
             */
            banner_url?: string;
            /**
             * @description Established year
             * @example 2024
             */
            established_year?: number;
            /** @description ISO date string (YYYY-MM-DD) */
            license_valid_till?: string;
            /** @description Services */
            services?: string[];
            /** @description Certifications */
            certifications?: components["schemas"]["CertificationDto"][];
            /** @description Social media */
            social_media?: components["schemas"]["SocialMediaDto"];
            /** @description Bank details */
            bank_details?: components["schemas"]["BankDetailsDto"];
            /** @description Contact persons */
            contact_persons?: components["schemas"]["ContactPersonDto"][];
            /** @description Operating hours */
            operating_hours?: components["schemas"]["OperatingHoursDto"];
            /** @description Target countries */
            target_countries?: string[];
            /** @description Specializations */
            specializations?: string[];
            /** @description Statistics */
            statistics?: components["schemas"]["StatisticsDto"];
            /** @description Settings */
            settings?: components["schemas"]["SettingsDto"];
            /** @description Single phone value; will be merged into phones[] */
            phone?: string;
            /** @description Single mobile value; will be merged into phones[] */
            mobile?: string;
            /** @description Single email value; will be merged into emails[] */
            email?: string;
        };
        AgencyCreatedDto: {
            /**
             * Format: uuid
             * @description Id
             */
            id: string;
            /**
             * @description License number
             * @example example
             */
            license_number: string;
        };
        UpdateAgencyBasicDto: {
            /**
             * @description Agency name
             * @example Example Agency
             */
            name?: string;
            /**
             * @description Agency description
             * @example Leading recruitment agency
             */
            description?: string;
            /**
             * @description Year the agency was established
             * @example 2020
             */
            established_year?: number;
            /**
             * @description License number
             * @example LIC-12345
             */
            license_number?: string;
        };
        UpdateAgencyContactDto: {
            /**
             * @description Primary phone number
             * @example +977-1-4123456
             */
            phone?: string;
            /**
             * @description Mobile phone number
             * @example +977-9841234567
             */
            mobile?: string;
            /**
             * @description Email address
             * @example contact@agency.com
             */
            email?: string;
            /**
             * @description Website URL
             * @example https://agency.com
             */
            website?: string;
            /**
             * @description Contact persons
             * @example [
             *       {
             *         "name": "John Doe",
             *         "position": "Manager",
             *         "phone": "+977-9841234567",
             *         "email": "john@agency.com"
             *       }
             *     ]
             */
            contact_persons?: components["schemas"]["ContactPersonDto"][];
        };
        UpdateAgencyLocationDto: {
            /**
             * @description Street address
             * @example 123 Main St, Kathmandu
             */
            address?: string;
            /**
             * @description Latitude coordinate
             * @example 27.7172
             */
            latitude?: number;
            /**
             * @description Longitude coordinate
             * @example 85.324
             */
            longitude?: number;
        };
        UpdateAgencySocialMediaDto: {
            /**
             * @description Facebook URL
             * @example https://facebook.com/agency
             */
            facebook?: string;
            /**
             * @description Instagram URL
             * @example https://instagram.com/agency
             */
            instagram?: string;
            /**
             * @description LinkedIn URL
             * @example https://linkedin.com/company/agency
             */
            linkedin?: string;
            /**
             * @description Twitter URL
             * @example https://twitter.com/agency
             */
            twitter?: string;
        };
        UpdateAgencyServicesDto: {
            /**
             * @description Services offered
             * @example [
             *       "Recruitment",
             *       "Visa Processing",
             *       "Training"
             *     ]
             */
            services?: string[];
            /**
             * @description Specializations
             * @example [
             *       "Healthcare",
             *       "IT",
             *       "Construction"
             *     ]
             */
            specializations?: string[];
            /**
             * @description Target countries
             * @example [
             *       "UAE",
             *       "Saudi Arabia",
             *       "Qatar"
             *     ]
             */
            target_countries?: string[];
        };
        UpdateAgencySettingsDto: {
            /**
             * @description Preferred currency
             * @example USD
             */
            currency?: string;
            /**
             * @description Timezone
             * @example Asia/Kathmandu
             */
            timezone?: string;
            /**
             * @description Language
             * @example en
             */
            language?: string;
            /**
             * @description Date format
             * @example YYYY-MM-DD
             */
            date_format?: string;
            /**
             * @description Notification preferences
             * @example {
             *       "email": true,
             *       "push": true,
             *       "sms": false
             *     }
             */
            notifications?: Record<string, never>;
        };
        ExperienceRequirementsDto: {
            /**
             * @description Min years
             * @example 2024
             */
            min_years?: number;
            /**
             * @description Max years
             * @example 2024
             */
            max_years?: number;
            /**
             * @description Level
             * @example null
             */
            level?: string;
        };
        UpdateJobTagsDto: {
            /**
             * @description Skills
             * @example example
             */
            skills?: string[];
            /**
             * @description Education requirements
             * @example example
             */
            education_requirements?: string[];
            /**
             * @description Experience requirements
             * @example null
             */
            experience_requirements?: components["schemas"]["ExperienceRequirementsDto"];
            /**
             * @description Canonical title ids
             * @example example
             */
            canonical_title_ids?: string[];
        };
        AgencyJobPostingListItemDto: {
            /**
             * Format: uuid
             * @description Id
             * @example d841e933-1a14-4602-97e2-c51c9e5d8cf2
             */
            id: string;
            /**
             * @description Posting title
             * @example Skilled Workers for ACME Co.
             */
            posting_title: string;
            /**
             * @description City
             * @example Dubai
             */
            city: Record<string, never> | null;
            /**
             * @description Country
             * @example UAE
             */
            country: string;
            /**
             * @description Employer company name
             * @example ACME Co.
             */
            employer_name: Record<string, never>;
            /**
             * @description Posting agency name
             * @example Global Recruiters
             */
            agency_name: Record<string, never>;
            /**
             * @description Total application count
             * @example 156
             */
            applicants_count: number;
            /**
             * @description Shortlisted application count
             * @example 45
             */
            shortlisted_count: number;
            /**
             * @description Total interviews count for this posting
             * @example 32
             */
            interviews_count: number;
            /**
             * @description Interviews scheduled for today (date in server's timezone)
             * @example 5
             */
            interviews_today_count: number;
            /**
             * @description Posting date (AD) in ISO format
             * @example 2025-09-01T00:00:00.000Z
             */
            posted_at: Record<string, never> | null;
        };
        PaginatedAgencyJobPostingsDto: {
            /** @description Data */
            data: components["schemas"]["AgencyJobPostingListItemDto"][];
            /**
             * @description Total
             * @example 10
             */
            total: number;
            /**
             * @description Page
             * @example 25
             */
            page: number;
            /**
             * @description Limit
             * @example 0
             */
            limit: number;
        };
        UploadResponseDto: {
            /**
             * @description Upload operation success status
             * @example true
             */
            success: boolean;
            /**
             * @description File URL if upload successful
             * @example /uploads/candidates/123e4567-e89b-12d3-a456-426614174000/profile.jpg
             */
            url?: string;
            /**
             * @description Success message
             * @example File uploaded successfully
             */
            message?: string;
            /**
             * @description Error message if upload failed
             * @example File size exceeds 5MB limit
             */
            error?: string;
        };
        CreateReviewDto: {
            /**
             * @description Rating from 1 to 5
             * @example 5
             */
            rating: number;
            /**
             * @description Review text content
             * @example Excellent service! Very professional and helpful staff.
             */
            review_text: string;
        };
        ReviewResponseDto: {
            /**
             * @description Review UUID
             * @example d841e933-1a14-4602-97e2-c51c9e5d8cf2
             */
            id: string;
            /**
             * @description Agency UUID
             * @example a123e933-1a14-4602-97e2-c51c9e5d8cf2
             */
            agency_id: string;
            /**
             * @description Candidate UUID
             * @example c456e933-1a14-4602-97e2-c51c9e5d8cf2
             */
            candidate_id: string;
            /**
             * @description Rating from 1 to 5
             * @example 5
             */
            rating: number;
            /**
             * @description Review text content
             * @example Excellent service!
             */
            review_text: string;
            /**
             * Format: date-time
             * @description Review creation timestamp
             * @example 2025-11-15T10:30:00.000Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @description Review last update timestamp
             * @example 2025-11-15T10:30:00.000Z
             */
            updated_at: string;
            /**
             * @description Candidate full name (optional, for display)
             * @example Ramesh Kumar
             */
            candidate_name?: string;
        };
        UpdateReviewDto: {
            /**
             * @description Updated rating from 1 to 5
             * @example 4
             */
            rating?: number;
            /**
             * @description Updated review text content
             * @example Updated: Good service overall.
             */
            review_text?: string;
        };
        DeleteReviewResponseDto: {
            /**
             * @description Operation success status
             * @example true
             */
            success: boolean;
            /**
             * @description Success message
             * @example Review deleted successfully
             */
            message: string;
        };
        PaginatedReviewsResponseDto: {
            /** @description Array of reviews */
            data: components["schemas"]["ReviewResponseDto"][];
            /**
             * @description Total number of reviews
             * @example 25
             */
            total: number;
            /**
             * @description Current page number
             * @example 1
             */
            page: number;
            /**
             * @description Number of items per page
             * @example 10
             */
            limit: number;
        };
        JobDetailsWithAnalyticsDto: {
            /**
             * @description Job posting ID
             * @example job-uuid
             */
            id: string;
            /**
             * @description Job title
             * @example Cook
             */
            title: string;
            /**
             * @description Company name
             * @example Al Manara Restaurant
             */
            company: string;
            /**
             * @description Location
             * @example {
             *       "city": "Dubai",
             *       "country": "UAE"
             *     }
             */
            location: Record<string, never>;
            /**
             * @description Posted date
             * @example 2025-08-01T00:00:00.000Z
             */
            posted_date: string;
            /**
             * @description Job description
             * @example Looking for experienced cook...
             */
            description: string;
            /**
             * @description Job requirements
             * @example [
             *       "5 years experience",
             *       "English speaking"
             *     ]
             */
            requirements: string[];
            /**
             * @description Skills/tags
             * @example [
             *       "Cooking",
             *       "Restaurant",
             *       "Arabic Cuisine"
             *     ]
             */
            tags: string[];
            /** @description Analytics summary */
            analytics: Record<string, never>;
        };
        CandidateDocumentDto: {
            /**
             * @description Document ID
             * @example doc-uuid
             */
            id: string;
            /**
             * @description Document name
             * @example Resume.pdf
             */
            name: string;
            /**
             * @description Document type
             * @example resume
             */
            type: string;
            /**
             * @description Document URL
             * @example /uploads/documents/resume.pdf
             */
            url: string;
        };
        JobCandidateDto: {
            /**
             * @description Candidate ID
             * @example candidate-uuid
             */
            id: string;
            /**
             * @description Candidate full name
             * @example Ram Bahadur Thapa
             */
            name: string;
            /**
             * @description Priority/fitness score (0-100)
             * @example 85
             */
            priority_score: number;
            /**
             * @description Location
             * @example {
             *       "city": "Kathmandu",
             *       "country": "Nepal"
             *     }
             */
            location: Record<string, never>;
            /**
             * @description Phone number
             * @example +977-9841234567
             */
            phone: string;
            /**
             * @description Email address
             * @example ram.thapa@example.com
             */
            email: string;
            /**
             * @description Years of experience
             * @example 5 years
             */
            experience: string;
            /**
             * @description Skills array
             * @example [
             *       "Cooking",
             *       "English",
             *       "Fast Food"
             *     ]
             */
            skills: string[];
            /**
             * @description Application date
             * @example 2025-08-25T10:30:00.000Z
             */
            applied_at: string;
            /**
             * @description Application ID
             * @example application-uuid
             */
            application_id: string;
            /** @description Attached documents */
            documents?: components["schemas"]["CandidateDocumentDto"][];
            /**
             * @description Interview details (if scheduled)
             * @example {
             *       "id": "interview-uuid",
             *       "scheduled_at": "2025-12-01T00:00:00.000Z",
             *       "time": "10:00:00",
             *       "duration": 60,
             *       "location": "Office",
             *       "interviewer": "HR Manager",
             *       "notes": "Bring original documents",
             *       "required_documents": [
             *         "passport",
             *         "cv"
             *       ]
             *     }
             */
            interview?: Record<string, never>;
        };
        PaginationDto: {
            /**
             * @description Total number of candidates
             * @example 45
             */
            total: number;
            /**
             * @description Current limit
             * @example 10
             */
            limit: number;
            /**
             * @description Current offset
             * @example 0
             */
            offset: number;
            /**
             * @description Has more results
             * @example true
             */
            has_more: boolean;
        };
        GetJobCandidatesResponseDto: {
            /** @description Array of candidates */
            candidates: components["schemas"]["JobCandidateDto"][];
            /** @description Pagination metadata */
            pagination: components["schemas"]["PaginationDto"];
        };
        BulkShortlistDto: {
            /**
             * @description Array of candidate IDs to shortlist
             * @example [
             *       "candidate-uuid-1",
             *       "candidate-uuid-2"
             *     ]
             */
            candidate_ids: string[];
        };
        BulkActionResponseDto: {
            /**
             * @description Operation success status
             * @example true
             */
            success: boolean;
            /**
             * @description Number of candidates updated
             * @example 5
             */
            updated_count: number;
            /**
             * @description Array of candidate IDs that failed to update
             * @example [
             *       "candidate-uuid-3"
             *     ]
             */
            failed?: string[];
            /**
             * @description Error details for failed operations
             * @example {
             *       "candidate-uuid-3": "Candidate not found"
             *     }
             */
            errors?: Record<string, never>;
        };
        BulkRejectDto: {
            /**
             * @description Array of candidate IDs to reject
             * @example [
             *       "candidate-uuid-1",
             *       "candidate-uuid-2"
             *     ]
             */
            candidate_ids: string[];
            /**
             * @description Reason for rejection
             * @example Does not meet minimum requirements
             */
            reason?: string;
        };
        BulkScheduleInterviewDto: {
            /**
             * @description Array of candidate IDs to schedule interviews for
             * @example [
             *       "candidate-uuid-1",
             *       "candidate-uuid-2"
             *     ]
             */
            candidate_ids: string[];
            /**
             * @description Interview date in AD format
             * @example 2025-12-01
             */
            interview_date_ad: string;
            /**
             * @description Interview date in BS format
             * @example 2082-08-15
             */
            interview_date_bs?: string;
            /**
             * @description Interview time
             * @example 10:00 AM
             */
            interview_time: string;
            /**
             * @description Interview duration in minutes
             * @default 60
             * @example 60
             */
            duration_minutes?: number;
            /**
             * @description Interview location
             * @example Office
             */
            location: string;
            /**
             * @description Contact person name
             * @example HR Manager
             */
            contact_person: string;
            /**
             * @description Required documents
             * @example [
             *       "passport",
             *       "cv"
             *     ]
             */
            required_documents?: string[];
            /** @description Additional notes */
            notes?: string;
            /** @description User ID who is scheduling */
            updatedBy?: string;
        };
        CandidateBasicDto: {
            /**
             * @description Id
             * @example example
             */
            id: string;
            /**
             * @description Name
             * @example Example Name
             */
            name: string;
            /**
             * @description Phone
             * @example +1234567890
             */
            phone: string;
            /**
             * @description Email
             * @example user@example.com
             */
            email?: Record<string, never>;
            /**
             * @description Gender
             * @example example
             */
            gender?: Record<string, never>;
            /**
             * @description Age
             * @example 25
             */
            age?: Record<string, never>;
            /**
             * @description Address
             * @example example
             */
            address?: Record<string, never>;
            /**
             * @description Passport number
             * @example example
             */
            passport_number?: Record<string, never>;
            /**
             * @description Profile image
             * @example example
             */
            profile_image?: Record<string, never>;
            /**
             * @description Is active
             * @example true
             */
            is_active: boolean;
        };
        EducationItemDto: {
            /**
             * @description Degree
             * @example example
             */
            degree: string;
            /**
             * @description Institution
             * @example example
             */
            institution?: string;
            /**
             * @description Year completed
             * @example 2024
             */
            year_completed?: number;
        };
        TrainingItemDto: {
            /**
             * @description Title
             * @example example
             */
            title: string;
            /**
             * @description Provider
             * @example example
             */
            provider?: string;
            /**
             * @description Hours
             * @example 0
             */
            hours?: number;
            /**
             * @description Certificate
             * @example true
             */
            certificate?: boolean;
        };
        ExperienceItemDto: {
            /**
             * @description Title
             * @example example
             */
            title: string;
            /**
             * @description Employer
             * @example example
             */
            employer?: string;
            /**
             * @description Start date ad
             * @example example
             */
            start_date_ad?: string;
            /**
             * @description End date ad
             * @example example
             */
            end_date_ad?: string;
            /**
             * @description Months
             * @example 0
             */
            months?: number;
            /**
             * @description Description
             * @example example
             */
            description?: string;
        };
        JobProfileDto: {
            /**
             * @description Summary
             * @example example
             */
            summary?: Record<string, never>;
            /** @description Skills */
            skills: string[];
            /** @description Education */
            education: components["schemas"]["EducationItemDto"][];
            /** @description Trainings */
            trainings: components["schemas"]["TrainingItemDto"][];
            /** @description Experience */
            experience: components["schemas"]["ExperienceItemDto"][];
        };
        JobContextDto: {
            /**
             * @description Job id
             * @example example
             */
            job_id: string;
            /**
             * @description Job title
             * @example example
             */
            job_title: string;
            /**
             * @description Job company
             * @example example
             */
            job_company?: Record<string, never>;
            /**
             * @description Job location
             * @example example
             */
            job_location: Record<string, never>;
        };
        ApplicationHistoryEntryDto: {
            /**
             * @description Prev status
             * @example example
             */
            prev_status?: Record<string, never>;
            /**
             * @description Next status
             * @example example
             */
            next_status: string;
            /**
             * @description Updated at
             * @example example
             */
            updated_at: string;
            /**
             * @description Updated by
             * @example example
             */
            updated_by?: Record<string, never>;
            /**
             * @description Note
             * @example example
             */
            note?: Record<string, never>;
            /**
             * @description Corrected
             * @example true
             */
            corrected?: boolean;
        };
        ApplicationDto: {
            /**
             * @description Id
             * @example example
             */
            id: string;
            /**
             * @description Position id
             * @example example
             */
            position_id: string;
            /**
             * @description Position title
             * @example example
             */
            position_title?: Record<string, never>;
            /**
             * @description Status
             * @example example
             */
            status: string;
            /**
             * @description Created at
             * @example example
             */
            created_at: string;
            /**
             * @description Updated at
             * @example example
             */
            updated_at: string;
            /** @description History blob */
            history_blob: components["schemas"]["ApplicationHistoryEntryDto"][];
        };
        InterviewDto: {
            /**
             * @description Id
             * @example example
             */
            id: string;
            /**
             * @description Interview date ad
             * @example example
             */
            interview_date_ad?: Record<string, never>;
            /**
             * @description Interview date bs
             * @example example
             */
            interview_date_bs?: Record<string, never>;
            /**
             * @description Interview time
             * @example example
             */
            interview_time?: Record<string, never>;
            /**
             * @description Location
             * @example example
             */
            location?: Record<string, never>;
            /**
             * @description Contact person
             * @example example
             */
            contact_person?: Record<string, never>;
            /** @description Required documents */
            required_documents?: string[];
            /**
             * @description Notes
             * @example example
             */
            notes?: Record<string, never>;
            /** @description Expenses */
            expenses: components["schemas"]["InterviewExpenseDto"][];
        };
        CandidateFullDetailsDto: {
            /** @description Candidate */
            candidate: components["schemas"]["CandidateBasicDto"];
            /** @description Job profile */
            job_profile: components["schemas"]["JobProfileDto"];
            /** @description Job context */
            job_context: components["schemas"]["JobContextDto"];
            /** @description Application */
            application: components["schemas"]["ApplicationDto"];
            /** @description Interview */
            interview?: components["schemas"]["InterviewDto"];
        };
        InterviewStatsDto: {
            /**
             * @description Total scheduled interviews
             * @example 45
             */
            total_scheduled: number;
            /**
             * @description Interviews scheduled for today
             * @example 5
             */
            today: number;
            /**
             * @description Interviews scheduled for tomorrow
             * @example 3
             */
            tomorrow: number;
            /**
             * @description Unattended interviews (no-show)
             * @example 2
             */
            unattended: number;
            /**
             * @description Completed interviews
             * @example 30
             */
            completed: number;
            /**
             * @description Passed interviews
             * @example 22
             */
            passed: number;
            /**
             * @description Failed interviews
             * @example 8
             */
            failed: number;
            /**
             * @description Cancelled interviews
             * @example 3
             */
            cancelled: number;
        };
        ApplicationItemDto: {
            /**
             * @description Application ID
             * @example 550e8400-e29b-41d4-a716-446655440000
             */
            id: string;
            /**
             * @description Candidate ID
             * @example 550e8400-e29b-41d4-a716-446655440001
             */
            candidate_id: string;
            /**
             * @description Job posting ID
             * @example 550e8400-e29b-41d4-a716-446655440002
             */
            job_posting_id: string;
            /**
             * @description Position ID
             * @example 550e8400-e29b-41d4-a716-446655440003
             */
            position_id: string;
            /**
             * @description Application status
             * @example applied
             * @enum {string}
             */
            status: "applied" | "shortlisted" | "interview_scheduled" | "interview_rescheduled" | "interview_passed" | "interview_failed" | "withdrawn";
            /**
             * @description Priority score based on candidate match (0-100)
             * @example 85
             */
            priority_score: number;
            /**
             * Format: date-time
             * @description Application creation date
             * @example 2025-11-29T10:30:00.000Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @description Last update date
             * @example 2025-11-29T12:45:00.000Z
             */
            updated_at: string;
            /**
             * @description Withdrawal date (null if not withdrawn)
             * @example null
             */
            withdrawn_at: Record<string, never> | null;
        };
        PerformanceDto: {
            /**
             * @description Total load time in milliseconds
             * @example 120
             */
            loadTime: number;
            /**
             * @description Database query time in milliseconds
             * @example 85
             */
            queryTime: number;
        };
        GetAgencyApplicationsResponseDto: {
            /** @description Array of applications (without duplicated candidate/job/position data) */
            applications: components["schemas"]["ApplicationItemDto"][];
            /**
             * @description Candidate lookup map (key: candidate_id)
             * @example {
             *       "550e8400-e29b-41d4-a716-446655440001": {
             *         "id": "550e8400-e29b-41d4-a716-446655440001",
             *         "full_name": "John Doe",
             *         "phone": "+977-9812345678",
             *         "email": "john.doe@example.com",
             *         "skills": [
             *           "Cooking",
             *           "Arabic Cuisine"
             *         ],
             *         "age": 28,
             *         "gender": "male"
             *       }
             *     }
             */
            candidates: Record<string, never>;
            /**
             * @description Job posting lookup map (key: job_posting_id)
             * @example {
             *       "550e8400-e29b-41d4-a716-446655440002": {
             *         "id": "550e8400-e29b-41d4-a716-446655440002",
             *         "posting_title": "Cook - UAE Project",
             *         "company_name": "Al Manara Restaurant",
             *         "country": "UAE",
             *         "city": "Dubai"
             *       }
             *     }
             */
            jobs: Record<string, never>;
            /**
             * @description Position lookup map (key: position_id)
             * @example {
             *       "550e8400-e29b-41d4-a716-446655440003": {
             *         "id": "550e8400-e29b-41d4-a716-446655440003",
             *         "title": "Cook",
             *         "monthly_salary_amount": 1200,
             *         "salary_currency": "AED",
             *         "total_vacancies": 5
             *       }
             *     }
             */
            positions: Record<string, never>;
            /** @description Pagination metadata */
            pagination: components["schemas"]["PaginationDto"];
            /** @description Performance metrics */
            performance: components["schemas"]["PerformanceDto"];
        };
        AgencyJobCountriesResponseDto: {
            /**
             * @description List of unique countries from agency job postings
             * @example [
             *       "UAE",
             *       "Qatar",
             *       "Saudi Arabia"
             *     ]
             */
            countries: string[];
        };
        AgencyApplicationStatisticsDto: {
            /**
             * @description Total number of applications
             * @example 45
             */
            total: number;
            /**
             * @description Application counts by status
             * @example {
             *       "applied": 20,
             *       "shortlisted": 15,
             *       "interview_scheduled": 10
             *     }
             */
            by_status: Record<string, never>;
            /**
             * @description Application counts by country
             * @example {
             *       "UAE": 25,
             *       "Qatar": 20
             *     }
             */
            by_country: Record<string, never>;
        };
        RegisterCandidateDto: {
            /**
             * @description Full name
             * @example Ram Bahadur
             */
            full_name: string;
            /**
             * @description Phone
             * @example +9779812345678
             */
            phone: string;
        };
        VerifyOtpDto: {
            /**
             * @description Phone
             * @example +9779812345678
             */
            phone: string;
            /**
             * @description Otp
             * @example 123456
             */
            otp: string;
        };
        LoginStartDto: {
            /**
             * @description Phone number in E.164 format
             * @example +9779812345678
             */
            phone: string;
        };
        RegisterOwnerDto: {
            /**
             * @description Phone number in E.164 format
             * @example +9779812345678
             */
            phone: string;
            /**
             * @description Full name of the agency owner
             * @example Ram Bahadur
             */
            full_name: string;
        };
        MemberLoginDto: {
            /**
             * @description Phone number in E.164 format
             * @example +9779812345678
             */
            phone: string;
            /**
             * @description Password
             * @example SecurePass123!
             */
            password: string;
        };
        RequestPhoneChangeDto: {
            /**
             * @description Candidate ID
             * @example 123e4567-e89b-12d3-a456-426614174000
             */
            candidateId: string;
            /**
             * @description New phone number in E.164 format
             * @example +9779812345678
             */
            newPhone: string;
        };
        VerifyPhoneChangeDto: {
            /**
             * @description Candidate ID
             * @example 123e4567-e89b-12d3-a456-426614174000
             */
            candidateId: string;
            /**
             * @description New phone number in E.164 format
             * @example +9779812345678
             */
            newPhone: string;
            /**
             * @description OTP code
             * @example 123456
             */
            otp: string;
        };
        CoordinatesDto: {
            /** @description Lat */
            lat: number;
            /** @description Lng */
            lng: number;
        };
        AddressDto: {
            /** @description Name */
            name?: string | null;
            /** @description Coordinates */
            coordinates?: components["schemas"]["CoordinatesDto"];
            /** @description Province */
            province?: string | null;
            /** @description District */
            district?: string | null;
            /** @description Municipality */
            municipality?: string | null;
            /** @description Ward */
            ward?: string | null;
        };
        CandidateProfileDto: {
            /**
             * @description Id
             * @example example
             */
            id: string;
            /**
             * @description Full name
             * @example Example Name
             */
            full_name: string;
            /** @description E.164 normalized */
            phone: string;
            /** @description Address */
            address?: components["schemas"]["AddressDto"] | null;
            /** @description Passport number */
            passport_number?: Record<string, never> | null;
            /** @description Email */
            email?: string | null;
            /**
             * @description Gender of the candidate
             * @enum {string|null}
             */
            gender?: "Male" | "Female" | null;
            /** @description Age of the candidate */
            age?: number | null;
            /**
             * @description Is active
             * @example true
             */
            is_active: boolean;
            /**
             * Format: date-time
             * @description Created at
             * @example 2024-01-01T00:00:00.000Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @description Updated at
             * @example 2024-01-01T00:00:00.000Z
             */
            updated_at: string;
        };
        MobileJobPositionDto: {
            /** @description Id */
            id: string;
            /** @description Title */
            title: string;
            /** @description Base salary */
            baseSalary?: string;
            /** @description Converted salary */
            convertedSalary?: string;
            /** @description Currency */
            currency?: string;
            /** @description Requirements */
            requirements?: string[];
            /** @description Whether the candidate has applied to this position */
            hasApplied?: boolean;
        };
        MobileContractTermsDto: {
            /** @description Type */
            type: string;
            /** @description Duration */
            duration: string;
            /** @description Salary */
            salary?: string;
            /** @description Is renewable */
            isRenewable?: boolean;
            /** @description Notice period */
            noticePeriod?: string;
            /** @description Working hours */
            workingHours?: string;
            /** @description Probation period */
            probationPeriod?: string;
            /** @description Benefits */
            benefits?: string;
        };
        MobileJobPostingDto: {
            /** @description Id */
            id: string;
            /** @description Posting title */
            postingTitle: string;
            /** @description Country */
            country: string;
            /** @description City */
            city?: string | null;
            /** @description Agency */
            agency?: string;
            /** @description Employer */
            employer?: string;
            /** @description Positions */
            positions: components["schemas"]["MobileJobPositionDto"][];
            /** @description Description */
            description?: string;
            /**
             * @description Contract terms
             * @example {
             *       "type": "Full-time",
             *       "duration": "2 years",
             *       "salary": "50000-70000",
             *       "isRenewable": true,
             *       "noticePeriod": "1 month",
             *       "workingHours": "40 hours/week",
             *       "probationPeriod": "3 months",
             *       "benefits": "Health insurance, Paid leave"
             *     }
             */
            contractTerms?: components["schemas"]["MobileContractTermsDto"] | null;
            /** @description Is active */
            isActive: boolean;
            /**
             * Format: date-time
             * @description Posted date
             */
            postedDate?: string;
            /** @description Preference priority */
            preferencePriority?: string;
            /** @description Preference text */
            preferenceText?: string;
            /** @description Location */
            location?: string;
            /** @description Experience */
            experience?: string;
            /** @description Salary */
            salary?: string;
            /** @description Type */
            type?: string;
            /** @description Is remote */
            isRemote: boolean;
            /** @description Is featured */
            isFeatured: boolean;
            /** @description Company logo */
            companyLogo?: string;
            /** @description Match percentage */
            matchPercentage?: string;
            /** @description Converted salary */
            convertedSalary?: string;
            /** @description Applications */
            applications?: number;
            /** @description Policy */
            policy?: string;
        };
        CandidateUpdateDto: {
            /** @description Full name */
            full_name?: string;
            /** @description Is active */
            is_active?: boolean;
            /** @description Address */
            address?: components["schemas"]["AddressDto"] | null;
            /** @description Passport number */
            passport_number?: string | null;
            /** @description Email */
            email?: string | null;
            /**
             * @description Gender of the candidate
             * @enum {string|null}
             */
            gender?: "Male" | "Female" | null;
            /** @description Age of the candidate */
            age?: number | null;
        };
        SkillDto: {
            /**
             * @description Title
             * @example example
             */
            title: string;
            /** @description Duration months */
            duration_months?: number | null;
            /** @description Years */
            years?: number | null;
            /** @description Documents */
            documents?: string[];
        };
        EducationDto: {
            /**
             * @description Title
             * @example example
             */
            title: string;
            /** @description Institute */
            institute?: string | null;
            /** @description Degree */
            degree?: string | null;
            /** @description Document */
            document?: string | null;
        };
        CandidateCreateDto: {
            /**
             * @description Full name
             * @example Example Name
             */
            full_name: string;
            /** @description E.164 preferred */
            phone: string;
            /** @description Address */
            address?: components["schemas"]["AddressDto"];
            /** @description Passport number */
            passport_number?: string | null;
            /** @description Skills */
            skills?: components["schemas"]["SkillDto"][];
            /** @description Education */
            education?: components["schemas"]["EducationDto"][];
        };
        CandidateCreatedResponseDto: {
            /**
             * Format: uuid
             * @description Id
             */
            id: string;
        };
        CandidateJobDetailsDto: {
            /**
             * @description Id
             * @example example
             */
            id: string;
            /**
             * @description Posting title
             * @example example
             */
            posting_title: string;
            /**
             * @description Country
             * @example example
             */
            country: string;
            /** @description City */
            city?: Record<string, never> | null;
            /** @description Announcement type */
            announcement_type?: Record<string, never> | null;
            /** @description Posting date ad */
            posting_date_ad?: Record<string, never> | null;
            /** @description Notes */
            notes?: Record<string, never> | null;
            /** @description Agency */
            agency?: components["schemas"]["AgencyLiteDto"] | null;
            /** @description Employer */
            employer?: components["schemas"]["EmployerLiteDto"] | null;
            /** @description Contract */
            contract?: components["schemas"]["ContractDto"] | null;
            /** @description Positions */
            positions: components["schemas"]["PositionDto"][];
            /** @description Skills */
            skills?: string[];
            /** @description Education requirements */
            education_requirements?: string[];
            /** @description Experience requirements */
            experience_requirements?: Record<string, never> | null;
            /** @description Canonical titles */
            canonical_titles?: string[];
            /** @description Expenses */
            expenses?: components["schemas"]["ExpensesDto"];
            /** @description Interview */
            interview?: Record<string, never> | null;
            /** @description Cutout url */
            cutout_url?: Record<string, never> | null;
            /** @description 0–100 */
            fitness_score?: number;
        };
        TrainingDto: {
            /** @description Title of the training */
            title: string;
            /** @description Provider of the training */
            provider?: string;
            /** @description Duration of the training in hours */
            hours?: number;
            /** @description Indicates if a certificate was obtained */
            certificate?: boolean;
        };
        ExperienceDto: {
            /** @description Job title */
            title: string;
            /** @description Employer name */
            employer?: string;
            /** @description Start date in ISO format (YYYY-MM-DD) */
            start_date_ad?: string;
            /** @description End date in ISO format (YYYY-MM-DD); if null, currently working */
            end_date_ad?: string;
            /** @description Duration in months */
            months?: number;
            /** @description Description of responsibilities and achievements */
            description?: string;
        };
        JobProfileBlobDto: {
            /** @description Summary of the job profile */
            summary?: string;
            /** @description List of skills */
            skills?: components["schemas"]["SkillDto"][];
            /** @description List of education qualifications */
            education?: components["schemas"]["EducationDto"][];
            /** @description List of trainings */
            trainings?: components["schemas"]["TrainingDto"][];
            /** @description List of work experiences */
            experience?: components["schemas"]["ExperienceDto"][];
        };
        UpdateJobProfileDto: {
            /** @description Profile blob holds skills, education, trainings, experience */
            profile_blob?: components["schemas"]["JobProfileBlobDto"];
            /** @description Label for the job profile (e.g., "Software Engineer Profile") */
            label?: string;
        };
        AddJobProfileResponseDto: {
            /**
             * Format: uuid
             * @description Id
             */
            id: string;
        };
        CandidateJobProfileDto: {
            /**
             * Format: uuid
             * @description Id
             */
            id: string;
            /**
             * Format: uuid
             * @description Candidate id
             */
            candidate_id: string;
            /** @description Profile blob */
            profile_blob: components["schemas"]["JobProfileBlobDto"];
            /** @description Optional label for this profile */
            label?: Record<string, never>;
            /** @description Creation timestamp (ISO string) */
            created_at: string;
            /** @description Last update timestamp (ISO string) */
            updated_at: string;
        };
        SalaryConvertedDto: {
            /** @description Amount */
            amount: number;
            /** @description Currency */
            currency: string;
        };
        SalarySummaryDto: {
            /** @description Monthly min */
            monthly_min?: number | null;
            /** @description Monthly max */
            monthly_max?: number | null;
            /** @description Currency */
            currency?: string | null;
            /** @description Converted */
            converted?: components["schemas"]["SalaryConvertedDto"][];
        };
        CardAgencyLiteDto: {
            /** @description Name */
            name: string;
            /** @description License number */
            license_number: string;
        };
        CardEmployerLiteDto: {
            /** @description Company name */
            company_name: string;
            /** @description Country */
            country: string;
            /** @description City */
            city?: string | null;
        };
        PositionSummaryDto: {
            /**
             * @description Position ID
             * @example 2f4a8d3b-1c5e-4f7a-9d2c-8e3f6a5b4d7e
             */
            id: string;
            /**
             * @description Title of the position
             * @example Senior Electrician
             */
            title: string;
            /**
             * @description Number of male vacancies
             * @example 3
             */
            male_vacancies: number;
            /**
             * @description Number of female vacancies
             * @example 2
             */
            female_vacancies: number;
            /**
             * @description Total number of vacancies
             * @example 5
             */
            total_vacancies: number;
            /**
             * @description Monthly salary amount
             * @example 2500
             */
            monthly_salary_amount: number;
            /**
             * @description Salary currency
             * @example USD
             */
            salary_currency: string;
            /**
             * @description Formatted salary range
             * @example 2500 USD
             */
            salary_display?: string;
            /** @description Converted salary amounts */
            converted_salaries?: {
                /** @example 333333.33 */
                amount?: number;
                /** @example NPR */
                currency?: string;
            }[];
            /**
             * @description Position notes or description
             * @example Experience with industrial electrical systems required
             */
            notes?: string;
            /**
             * @description Whether the candidate has applied to this position
             * @example true
             */
            has_applied?: boolean;
        };
        CandidateJobCardDto: {
            /** @description Id */
            id: string;
            /** @description Posting title */
            posting_title: string;
            /** @description Country */
            country: string;
            /** @description City */
            city?: string | null;
            /** @description Primary titles */
            primary_titles?: string[];
            /** @description Salary */
            salary?: components["schemas"]["SalarySummaryDto"];
            /** @description Agency */
            agency?: components["schemas"]["CardAgencyLiteDto"];
            /** @description Employer */
            employer?: components["schemas"]["CardEmployerLiteDto"];
            /** @description Posting date ad */
            posting_date_ad?: string | null;
            /** @description Cutout url */
            cutout_url?: string | null;
            /** @description 0–100 */
            fitness_score?: number;
            /** @description List of available positions for this job */
            positions?: components["schemas"]["PositionSummaryDto"][];
        };
        PaginatedJobsResponseDto: {
            /** @description Page */
            page: number;
            /** @description Limit */
            limit: number;
            /** @description Total */
            total: number;
            /** @description Data */
            data: components["schemas"]["CandidateJobCardDto"][];
        };
        GroupedJobsGroupDto: {
            /**
             * @description Title
             * @example example
             */
            title: string;
            /** @description Jobs */
            jobs: components["schemas"]["CandidateJobCardDto"][];
        };
        GroupedJobsResponseDto: {
            /** @description Groups */
            groups: components["schemas"]["GroupedJobsGroupDto"][];
        };
        PreferenceDto: {
            /**
             * Format: uuid
             * @description Id
             */
            id: string;
            /**
             * @description Title
             * @example example
             */
            title: string;
            /**
             * @description 1-based priority; lower means higher priority
             * @example 1
             */
            priority: number;
            /**
             * Format: uuid
             * @description Linked job title id when available
             */
            job_title_id: Record<string, never> | null;
        };
        AddPreferenceDto: {
            /** @description Job title string (must exist and be active in JobTitle) */
            title: string;
        };
        RemovePreferenceDto: {
            /** @description Job title string to remove */
            title: string;
        };
        ReorderPreferencesDto: {
            /**
             * @description Ordered list of preference row IDs. Preferred for drag-and-drop.
             * @example [
             *       "3f0e3a82-6c8b-4c42-9b22-9d9f7c8aec01",
             *       "f6d09772-b0a2-4a54-9e8c-0f1b9d49c3d2"
             *     ]
             */
            orderedIds?: string[];
            /**
             * @description Fallback: ordered list of titles (must be a permutation of existing titles).
             * @example [
             *       "Electrician",
             *       "Welder",
             *       "Plumber"
             *     ]
             */
            orderedTitles?: string[];
        };
        CandidateDocumentResponseDto: {
            /**
             * Format: uuid
             * @description Document unique identifier
             * @example 123e4567-e89b-12d3-a456-426614174000
             */
            id: string;
            /**
             * Format: uuid
             * @description Candidate unique identifier
             * @example 987fcdeb-51a2-43d1-9f12-345678901234
             */
            candidate_id: string;
            /**
             * Format: uuid
             * @description Document type unique identifier
             * @example 456e7890-e89b-12d3-a456-426614174111
             */
            document_type_id: string;
            /**
             * @description Document file URL
             * @example /uploads/candidates/987fcdeb-51a2-43d1-9f12-345678901234/documents/resume.pdf
             */
            document_url: string;
            /**
             * @description Document name
             * @example Resume - Software Engineer
             */
            name: string;
            /**
             * @description Document description
             * @example Updated resume with latest work experience
             */
            description?: string;
            /**
             * @description Additional notes
             * @example Verified by HR department
             */
            notes?: string;
            /**
             * @description File MIME type
             * @example application/pdf
             */
            file_type?: string;
            /**
             * @description File size in bytes
             * @example 1048576
             */
            file_size?: number;
            /**
             * @description Document active status
             * @example true
             */
            is_active: boolean;
            /**
             * @description Document verification status
             * @example pending
             * @enum {string}
             */
            verification_status: "pending" | "approved" | "rejected";
            /**
             * Format: uuid
             * @description User ID who verified the document
             * @example 789e0123-e89b-12d3-a456-426614174222
             */
            verified_by?: string;
            /**
             * Format: date-time
             * @description Document verification timestamp
             * @example 2024-01-16T10:30:00Z
             */
            verified_at?: string;
            /**
             * @description Rejection reason if document was rejected
             * @example Document is expired
             */
            rejection_reason?: string;
            /**
             * Format: date-time
             * @description Document creation timestamp
             * @example 2024-01-15T10:30:00Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @description Document last update timestamp
             * @example 2024-01-15T10:30:00Z
             */
            updated_at: string;
        };
        DocumentTypeResponseDto: {
            /**
             * Format: uuid
             * @description Document type unique identifier
             * @example 123e4567-e89b-12d3-a456-426614174000
             */
            id: string;
            /**
             * @description Document type name
             * @example Passport
             */
            name: string;
            /**
             * @description Document type code
             * @example PASSPORT
             */
            type_code: string;
            /**
             * @description Document type description
             * @example Valid passport document
             */
            description?: string;
            /**
             * @description Whether this document type is required
             * @example true
             */
            is_required: boolean;
            /**
             * @description Display order for UI
             * @example 1
             */
            display_order: number;
            /**
             * @description Allowed MIME types for this document
             * @example [
             *       "application/pdf",
             *       "image/jpeg",
             *       "image/png"
             *     ]
             */
            allowed_mime_types?: string[];
            /**
             * @description Maximum file size in MB
             * @example 10
             */
            max_file_size_mb?: number;
        };
        DocumentSlotResponseDto: {
            /** @description Document type information */
            document_type: components["schemas"]["DocumentTypeResponseDto"];
            /** @description Uploaded document information (null if not uploaded) */
            document?: components["schemas"]["CandidateDocumentDto"] | null;
        };
        DocumentsSummaryDto: {
            /**
             * @description Total number of document types
             * @example 7
             */
            total_types: number;
            /**
             * @description Number of uploaded documents
             * @example 2
             */
            uploaded: number;
            /**
             * @description Number of pending documents
             * @example 5
             */
            pending: number;
            /**
             * @description Number of required documents still pending
             * @example 1
             */
            required_pending: number;
        };
        DocumentsWithSlotsResponseDto: {
            /** @description List of document slots with upload status */
            data: components["schemas"]["DocumentSlotResponseDto"][];
            /** @description Summary of document upload status */
            summary: components["schemas"]["DocumentsSummaryDto"];
        };
        CountryResponseDto: {
            /**
             * @description Unique identifier of the country
             * @example a3b5c8e2-1234-4f7a-9b0d-abcdef123456
             */
            id: string;
            /**
             * @description ISO 3166-1 alpha-2 country code
             * @example US
             */
            country_code: string;
            /**
             * @description Full name of the country
             * @example United States
             */
            country_name: string;
            /**
             * @description ISO 4217 currency code
             * @example USD
             */
            currency_code: string;
            /**
             * @description Full name of the currency
             * @example US Dollar
             */
            currency_name: string;
            /**
             * @description Multiplier to convert to NPR (Nepalese Rupees)
             * @example 119.50
             */
            npr_multiplier: string;
            /**
             * Format: date-time
             * @description Date when the record was created
             */
            created_at: string;
            /**
             * Format: date-time
             * @description Date when the record was last updated
             */
            updated_at: string | null;
        };
        SeedCountriesResponseDto: {
            /** @description Source file path of the seed data */
            source: string;
            /** @description Number of records upserted */
            upserted: number;
        };
        SeedCountsDto: {
            /**
             * @description Number of country rows upserted
             * @example {
             *       "affected": 46
             *     }
             */
            countries?: Record<string, never> | null;
            /**
             * @description Number of job title rows upserted
             * @example {
             *       "affected": 51
             *     }
             */
            job_titles?: Record<string, never> | null;
            /**
             * @description Number of document types upserted
             * @example {
             *       "affected": 7
             *     }
             */
            document_types?: Record<string, never> | null;
            /**
             * @description Number of agencies created (skips existing by license)
             * @example {
             *       "created": 10
             *     }
             */
            agencies?: Record<string, never> | null;
            /**
             * @description Number of agency owners created
             * @example {
             *       "created": 5
             *     }
             */
            agency_owners?: Record<string, never> | null;
            /**
             * @description Number of sample postings created
             * @example {
             *       "created": 1
             *     }
             */
            sample_postings?: Record<string, never> | null;
            /**
             * @description Dev: Number of postings created and tagged across seeded agencies
             * @example {
             *       "created": 10,
             *       "tagged": 10
             *     }
             */
            dev_agency_postings_with_tags?: Record<string, never> | null;
        };
        SeedRequestDto: {
            /**
             * @description Seed countries (primary). Default: true
             * @default true
             */
            countries?: boolean;
            /**
             * @description Seed job titles (primary). Default: true
             * @default true
             */
            job_titles?: boolean;
            /**
             * @description Seed document types (primary). Default: true
             * @default true
             */
            document_types?: boolean;
            /**
             * @description Seed agencies (secondary). Default: false
             * @default false
             */
            agencies?: boolean;
            /**
             * @description Seed sample job postings (secondary). Default: false
             * @default false
             */
            sample_postings?: boolean;
            /**
             * @description Dev: create at least one posting per seeded agency and tag them for frontend testing. Default: false
             * @default false
             */
            dev_agency_postings_with_tags?: boolean;
        };
        AdminJobAgencyDto: {
            /** @description Agency ID */
            id: string;
            /** @description Agency name */
            name: string;
            /** @description Agency license number */
            license_number: string;
        };
        AdminJobItemDto: {
            /** @description Job posting ID */
            id: string;
            /** @description Job title */
            title: string;
            /** @description Company/Employer name */
            company: string;
            /** @description Country */
            country: string;
            /** @description City */
            city?: string;
            /**
             * Format: date-time
             * @description Created date
             */
            created_at: string;
            /**
             * Format: date-time
             * @description Published date
             */
            published_at?: string;
            /**
             * @description Formatted salary string
             * @example 1200 AED
             */
            salary: string;
            /** @description Currency code */
            currency: string;
            /** @description Salary amount */
            salary_amount: number;
            /** @description Total applications count */
            applications_count: number;
            /** @description Shortlisted candidates count */
            shortlisted_count: number;
            /** @description Interviews scheduled for today */
            interviews_today: number;
            /** @description Total interviews count */
            total_interviews: number;
            /**
             * @description View count
             * @default 0
             */
            view_count: number;
            /** @description Job category/position title */
            category: string;
            /** @description Skills tags */
            tags: string[];
            /** @description Education requirements */
            requirements: string[];
            /** @description Job description */
            description?: string;
            /** @description Working hours */
            working_hours?: string;
            /** @description Accommodation provision */
            accommodation?: string;
            /** @description Food provision */
            food?: string;
            /** @description Visa status */
            visa_status?: string;
            /** @description Contract duration */
            contract_duration?: string;
            /** @description Agency */
            agency?: components["schemas"]["AdminJobAgencyDto"];
        };
        AdminJobListResponseDto: {
            /** @description Array of jobs */
            data: components["schemas"]["AdminJobItemDto"][];
            /** @description Total number of jobs matching filters */
            total: number;
            /** @description Current page number */
            page: number;
            /** @description Items per page */
            limit: number;
            /** @description Applied filters */
            filters: Record<string, never>;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
    DomainController_seedV1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PublicJobsController_searchJobs: {
        parameters: {
            query?: {
                /** @description Search across job title, position title, employer, agency */
                keyword?: string;
                /** @description Filter by country (case-insensitive) */
                country?: string;
                /** @description Minimum salary amount */
                min_salary?: number;
                /** @description Maximum salary amount */
                max_salary?: number;
                /** @description Currency for salary filtering */
                currency?: "AED" | "USD" | "NPR" | "QAR" | "SAR" | "KWD" | "BHD" | "OMR";
                /** @description Page number (default: 1) */
                page?: number;
                /** @description Items per page (default: 10, max: 100) */
                limit?: number;
                /** @description Sort by field (default: posted_at) */
                sort_by?: "posted_at" | "salary" | "relevance";
                /** @description Sort order (default: desc) */
                order?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Search results with pagination and metadata */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobSearchResponseDto"];
                };
            };
        };
    };
    PublicJobsController_getJobDetails: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Job Posting ID (UUID v4) */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Detailed job information */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobDetailsDto"];
                };
            };
        };
    };
    InterviewsController_list: {
        parameters: {
            query: {
                order?: "upcoming" | "recent";
                only_upcoming?: boolean;
                limit?: number;
                page?: number;
                /** @description One or more candidate UUIDs */
                candidate_ids: string[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated interviews */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedInterviewsDto"];
                };
            };
        };
    };
    JobTitleController_listAll: {
        parameters: {
            query?: {
                /** @description true|false */
                is_active?: string;
                /** @description Search by title (ILIKE) */
                q?: string;
                /** @description Max rows to return */
                limit?: string;
                /** @description Offset for pagination */
                offset?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobTitleListResponseDto"];
                };
            };
        };
    };
    JobTitleController_seedV1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobTitleSeedResponseDto"];
                };
            };
        };
    };
    ApplicationController_apply: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Job application details including candidate ID, job posting ID, and optional note */
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApplyJobDto"];
            };
        };
        responses: {
            /** @description Application submitted successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApplyJobResponseDto"];
                };
            };
            /** @description Invalid request - candidate not found, job posting not found, job posting inactive, or candidate already applied */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "statusCode": 400,
                     *       "message": "Candidate has already applied to this posting",
                     *       "error": "Bad Request"
                     *     }
                     */
                    "application/json": unknown;
                };
            };
        };
    };
    ApplicationController_listForCandidate: {
        parameters: {
            query?: {
                /** @description Optional application status filter. Allowed values: applied, shortlisted, interview_scheduled, interview_rescheduled, interview_passed, interview_failed, withdrawn */
                status?: string;
                /** @description Page number (1-based). Defaults to 1. */
                page?: string;
                /** @description Page size (1-100). Defaults to 20. */
                limit?: string;
            };
            header?: never;
            path: {
                /** @description Candidate UUID (v4) */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated list of candidate applications */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedJobApplicationsDto"];
                };
            };
        };
    };
    ApplicationController_shortlist: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ApplicationController_scheduleInterview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ApplicationController_rescheduleInterview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Application UUID (v4) */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ApplicationController_completeInterview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ApplicationController_withdraw: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ApplicationController_getApplicationDetails: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Application UUID (v4) */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Comprehensive application details */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApplicationDetailsDto"];
                };
            };
            /** @description Application not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "statusCode": 404,
                     *       "message": "Application not found",
                     *       "error": "Not Found"
                     *     }
                     */
                    "application/json": unknown;
                };
            };
        };
    };
    ApplicationController_getApplicationById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Application UUID (v4) */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Application details with complete history */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApplicationDetailDto"];
                };
            };
            /** @description Application not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "statusCode": 404,
                     *       "message": "Application not found",
                     *       "error": "Not Found"
                     *     }
                     */
                    "application/json": unknown;
                };
            };
        };
    };
    ApplicationController_analytics: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID (UUID v4) */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Analytics summary for the candidate */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApplicationAnalyticsDto"];
                };
            };
        };
    };
    NotificationController_getNotifications: {
        parameters: {
            query: {
                /** @description UUID of the candidate to get notifications for */
                candidateId: string;
                /** @description Page number (default: 1) */
                page?: number;
                /** @description Number of items per page (default: 20, max: 100) */
                limit?: number;
                /** @description Filter to show only unread notifications (default: false) */
                unreadOnly?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated list of notifications */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationListResponseDto"];
                };
            };
            /** @description Bad request - candidateId is required */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationController_getUnreadCount: {
        parameters: {
            query: {
                /** @description UUID of the candidate to get unread count for */
                candidateId: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Unread notification count */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Number of unread notifications */
                        count?: number;
                    };
                };
            };
            /** @description Bad request - candidateId is required */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationController_markAsRead: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID of the notification to mark as read */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Notification marked as read successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MarkAsReadResponseDto"];
                };
            };
            /** @description Notification not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationController_markAllAsRead: {
        parameters: {
            query: {
                /** @description UUID of the candidate to mark all notifications as read */
                candidateId: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description All notifications marked as read successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MarkAllAsReadResponseDto"];
                };
            };
            /** @description Bad request - candidateId is required */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_searchAgencies: {
        parameters: {
            query?: {
                /** @description Search term to look up agencies by name, description, location, or specializations */
                keyword?: string;
                /** @description Page number */
                page?: number;
                /** @description Items per page (max 100) */
                limit?: number;
                /** @description Field to sort by */
                sortBy?: "name" | "country" | "city" | "created_at";
                /** @description Sort order */
                sortOrder?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Returns paginated list of agencies matching the search criteria */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedAgencyResponseDto"];
                };
            };
        };
    };
    AgencyController_getAgencyById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency UUID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Agency details retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyResponseDto"];
                };
            };
            /** @description Agency not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_getAgencyByLicense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Agency details retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyResponseDto"];
                };
            };
            /** @description Agency not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_getMyAgency: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Agency details */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyResponseDto"];
                };
            };
            /** @description Forbidden if user is not an agency owner */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not found if agency does not exist */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_createMyAgency: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAgencyDto"];
            };
        };
        responses: {
            /** @description Agency created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyCreatedDto"];
                };
            };
        };
    };
    AgencyController_updateMyAgencyBasic: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAgencyBasicDto"];
            };
        };
        responses: {
            /** @description Updated agency profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyResponseDto"];
                };
            };
        };
    };
    AgencyController_updateMyAgencyContact: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAgencyContactDto"];
            };
        };
        responses: {
            /** @description Updated agency profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyResponseDto"];
                };
            };
        };
    };
    AgencyController_updateMyAgencyLocation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAgencyLocationDto"];
            };
        };
        responses: {
            /** @description Updated agency profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyResponseDto"];
                };
            };
        };
    };
    AgencyController_updateMyAgencySocialMedia: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAgencySocialMediaDto"];
            };
        };
        responses: {
            /** @description Updated agency profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyResponseDto"];
                };
            };
        };
    };
    AgencyController_updateMyAgencyServices: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAgencyServicesDto"];
            };
        };
        responses: {
            /** @description Updated agency profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyResponseDto"];
                };
            };
        };
    };
    AgencyController_updateMyAgencySettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAgencySettingsDto"];
            };
        };
        responses: {
            /** @description Updated agency profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyResponseDto"];
                };
            };
        };
    };
    AgencyController_inviteMember: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    full_name: string;
                    phone: string;
                    /** @enum {string} */
                    role?: "staff" | "admin" | "manager" | "recruiter" | "coordinator" | "visaOfficer" | "accountant";
                };
            };
        };
        responses: {
            /** @description Member invited */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id?: string;
                        phone?: string;
                        role?: string;
                        dev_password?: string;
                    };
                };
            };
        };
    };
    AgencyController_resetMemberPassword: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Password reset */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id?: string;
                        phone?: string;
                        dev_password?: string;
                    };
                };
            };
        };
    };
    AgencyController_listMembers: {
        parameters: {
            query?: {
                /** @description Search by name or phone */
                search?: string;
                /** @description Filter by role */
                role?: string;
                /** @description Filter by status */
                status?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of members */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id?: string;
                        full_name?: string;
                        phone?: string;
                        role?: string;
                        status?: string;
                        /** Format: date-time */
                        created_at?: string;
                    }[];
                };
            };
        };
    };
    AgencyController_getMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Member details */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id?: string;
                        full_name?: string;
                        phone?: string;
                        role?: string;
                        status?: string;
                        /** Format: date-time */
                        created_at?: string;
                    };
                };
            };
        };
    };
    AgencyController_deleteMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Member deleted */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_updateMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    full_name?: string;
                    role?: string;
                };
            };
        };
        responses: {
            /** @description Member updated */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id?: string;
                        full_name?: string;
                        phone?: string;
                        role?: string;
                        status?: string;
                        /** Format: date-time */
                        created_at?: string;
                    };
                };
            };
        };
    };
    AgencyController_updateMemberStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    status: "active" | "inactive" | "pending" | "suspended";
                };
            };
        };
        responses: {
            /** @description Member status updated */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id?: string;
                        status?: string;
                    };
                };
            };
        };
    };
    AgencyController_createAgency: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAgencyDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyCreatedDto"];
                };
            };
        };
    };
    AgencyController_getJobPosting: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_updateJobPosting: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_getApplicantsByPhase: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_seedV1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_listAgencyJobPostings: {
        parameters: {
            query?: {
                /** @description Free-text search across title, ref ids (lt_number, chalani_number), employer, agency, position title */
                q?: string;
                /** @description Filter by posting title (ILIKE) */
                title?: string;
                /** @description Filter by reference id (lt_number or chalani_number) (ILIKE) */
                refid?: string;
                /** @description Filter by employer company name (ILIKE) */
                employer_name?: string;
                /** @description Filter by agency name (ILIKE). Redundant when filtering by a single license */
                agency_name?: string;
                /** @description Filter by country (ILIKE). Uses job posting's country (not agency address). Accepts code or name */
                country?: string;
                /** @description Filter by position title within posting positions (ILIKE) */
                position_title?: string;
                /** @description Sort by */
                sort_by?: "interviews_today" | "shortlisted" | "applicants" | "posted_at";
                /** @description Order */
                order?: "asc" | "desc";
                /** @description Page */
                page?: number;
                /** @description Limit */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated list of agency job postings with analytics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedAgencyJobPostingsDto"];
                };
            };
        };
    };
    AgencyController_createJobPostingForAgency: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_getJobPostingTags: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_updateJobPostingTags: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateJobTagsDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_addMedicalExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_addInsuranceExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_addTravelExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_addVisaExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_addTrainingExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_addWelfareExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_getInterview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_createInterview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_updateInterview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                license: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_uploadCutout: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file?: string;
                };
            };
        };
        responses: {
            /** @description Cutout uploaded successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResponseDto"];
                };
            };
        };
    };
    AgencyController_removeCutout: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Cutout removed successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResponseDto"];
                };
            };
        };
    };
    AgencyController_togglePublished: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description New published status */
                    is_published: boolean;
                };
            };
        };
        responses: {
            /** @description Published status toggled successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyController_uploadLogo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file?: string;
                };
            };
        };
        responses: {
            /** @description Logo uploaded successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResponseDto"];
                };
            };
        };
    };
    AgencyController_deleteLogo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Logo removed successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResponseDto"];
                };
            };
        };
    };
    AgencyController_uploadBanner: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file?: string;
                };
            };
        };
        responses: {
            /** @description Banner uploaded successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResponseDto"];
                };
            };
        };
    };
    AgencyController_deleteBanner: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Banner removed successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResponseDto"];
                };
            };
        };
    };
    AgencyReviewController_listReviews: {
        parameters: {
            query?: {
                /** @description Page number (default: 1) */
                page?: number;
                /** @description Items per page, max 100 (default: 10) */
                limit?: number;
                /** @description Optional candidate UUID to identify own review in the list */
                candidate_id?: string;
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Reviews retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedReviewsResponseDto"];
                };
            };
            /** @description Agency not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyReviewController_createReview: {
        parameters: {
            query: {
                /** @description Candidate UUID */
                candidate_id: string;
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReviewDto"];
            };
        };
        responses: {
            /** @description Review created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewResponseDto"];
                };
            };
            /** @description Invalid input or duplicate review */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Agency not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyReviewController_deleteReview: {
        parameters: {
            query: {
                /** @description Candidate UUID */
                candidate_id: string;
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Review UUID */
                reviewId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Review deleted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeleteReviewResponseDto"];
                };
            };
            /** @description Cannot delete other candidate reviews */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Review not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyReviewController_updateReview: {
        parameters: {
            query: {
                /** @description Candidate UUID */
                candidate_id: string;
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Review UUID */
                reviewId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateReviewDto"];
            };
        };
        responses: {
            /** @description Review updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewResponseDto"];
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cannot modify other candidate reviews */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Review not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    JobCandidatesController_getJobDetailsWithAnalytics: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID (UUID) */
                jobId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Job details with analytics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobDetailsWithAnalyticsDto"];
                };
            };
        };
    };
    JobCandidatesController_getJobCandidates: {
        parameters: {
            query: {
                /** @description Application stage filter */
                stage: "applied" | "shortlisted" | "interview_scheduled" | "interview_rescheduled" | "interview_passed" | "interview_failed";
                /** @description Number of candidates to return (default: 10, max: 100) */
                limit?: number;
                /** @description Pagination offset (default: 0) */
                offset?: number;
                /** @description Comma-separated list of skills for filtering (AND logic) */
                skills?: string;
                /** @description Sort field (default: priority_score) */
                sort_by?: "priority_score" | "applied_at" | "name";
                /** @description Sort order (default: desc) */
                sort_order?: "asc" | "desc";
                /** @description Interview date filter (only for interview_scheduled stage) */
                interview_filter?: "today" | "tomorrow" | "unattended" | "all";
                /** @description Date alias for quick filtering (takes precedence over date_from/date_to) */
                date_alias?: "today" | "tomorrow" | "this_week" | "next_week" | "this_month";
                /** @description Start date for date range filter (YYYY-MM-DD) */
                date_from?: string;
                /** @description End date for date range filter (YYYY-MM-DD) */
                date_to?: string;
                /** @description Search query for candidate name, phone, or interviewer */
                search?: string;
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID (UUID) */
                jobId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated list of candidates */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetJobCandidatesResponseDto"];
                };
            };
        };
    };
    JobCandidatesController_bulkShortlist: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID (UUID) */
                jobId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BulkShortlistDto"];
            };
        };
        responses: {
            /** @description Bulk shortlist result */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BulkActionResponseDto"];
                };
            };
            /** @description Invalid request or candidates not in "applied" stage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    JobCandidatesController_getAvailableSkills: {
        parameters: {
            query?: {
                /** @description Filter by stage (default: applied) */
                stage?: string;
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID (UUID) */
                jobId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of unique skills from candidates */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * @example [
                         *       "Electrical Wiring",
                         *       "English (Language)",
                         *       "Cooking"
                         *     ]
                         */
                        available_skills?: string[];
                        /** @example 45 */
                        total_candidates?: number;
                    };
                };
            };
        };
    };
    JobCandidatesController_bulkReject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID (UUID) */
                jobId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BulkRejectDto"];
            };
        };
        responses: {
            /** @description Bulk reject result */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BulkActionResponseDto"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    JobCandidatesController_bulkScheduleInterview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID (UUID) */
                jobId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BulkScheduleInterviewDto"];
            };
        };
        responses: {
            /** @description Bulk schedule result */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BulkActionResponseDto"];
                };
            };
            /** @description Invalid request or candidates not in "shortlisted" stage */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    JobCandidatesController_getCandidateFullDetails: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID (UUID) */
                jobId: string;
                /** @description Candidate ID (UUID) */
                candidateId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Complete candidate details */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CandidateFullDetailsDto"];
                };
            };
        };
    };
    JobCandidatesController_getInterviewStats: {
        parameters: {
            query?: {
                /** @description Date range filter */
                date_range?: "today" | "week" | "month" | "all";
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
                /** @description Job posting ID (UUID) */
                jobId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Interview statistics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InterviewStatsDto"];
                };
            };
        };
    };
    AgencyApplicationsController_getApplications: {
        parameters: {
            query?: {
                /** @description Filter by application status */
                stage?: "applied" | "shortlisted" | "interview_scheduled" | "interview_rescheduled" | "interview_passed" | "interview_failed" | "withdrawn";
                /** @description Filter by job country */
                country?: string;
                /** @description Filter by specific job posting ID */
                job_posting_id?: string;
                /** @description Filter by specific position ID */
                position_id?: string;
                /** @description Search across candidate names, phones, emails, job titles, and skills */
                search?: string;
                /** @description Page number (1-based) */
                page?: number;
                /** @description Number of items per page */
                limit?: number;
                /** @description Field to sort by */
                sort_by?: "created_at" | "updated_at" | "status" | "applied_at";
                /** @description Sort order */
                sort_order?: "asc" | "desc";
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully retrieved applications */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetAgencyApplicationsResponseDto"];
                };
            };
            /** @description Invalid query parameters */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Agency not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    AgencyApplicationsController_getCountries: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully retrieved countries */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyJobCountriesResponseDto"];
                };
            };
            /** @description Agency not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyApplicationsController_getStatistics: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully retrieved statistics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgencyApplicationStatisticsDto"];
                };
            };
            /** @description Agency not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AgencyInterviewsController_getAllInterviewsForAgency: {
        parameters: {
            query?: {
                /** @description Filter by specific job ID (optional) */
                job_id?: string;
                /** @description Interview status filter */
                interview_filter?: "today" | "tomorrow" | "unattended" | "all";
                /** @description Date alias for quick filtering */
                date_alias?: "today" | "tomorrow" | "this_week" | "next_week" | "this_month";
                /** @description Start date (YYYY-MM-DD) */
                date_from?: string;
                /** @description End date (YYYY-MM-DD) */
                date_to?: string;
                /** @description Search by candidate name, phone, or interviewer */
                search?: string;
                /** @description Page size (default: 20, max: 100) */
                limit?: string;
                /** @description Pagination offset (default: 0) */
                offset?: string;
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of interviews with candidate details */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        candidates?: components["schemas"]["JobCandidateDto"][];
                        pagination?: {
                            total?: number;
                            limit?: number;
                            offset?: number;
                            has_more?: boolean;
                        };
                    };
                };
            };
        };
    };
    AgencyInterviewsController_getAgencyInterviewStats: {
        parameters: {
            query?: {
                /** @description Date range filter */
                date_range?: "today" | "week" | "month" | "all";
            };
            header?: never;
            path: {
                /** @description Agency license number */
                license: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Aggregated interview statistics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InterviewStatsDto"];
                };
            };
        };
    };
    AuthController_register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterCandidateDto"];
            };
        };
        responses: {
            /** @description OTP issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        dev_otp?: string;
                    };
                };
            };
        };
    };
    AuthController_verify: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyOtpDto"];
            };
        };
        responses: {
            /** @description Token issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        token?: string;
                        /** Format: uuid */
                        user_id?: string;
                        /** Format: uuid */
                        candidate_id?: string;
                        candidate?: Record<string, never>;
                    };
                };
            };
        };
    };
    AuthController_loginStart: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginStartDto"];
            };
        };
        responses: {
            /** @description OTP issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        dev_otp?: string;
                    };
                };
            };
        };
    };
    AuthController_loginVerify: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyOtpDto"];
            };
        };
        responses: {
            /** @description Token issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        token?: string;
                        /** Format: uuid */
                        user_id?: string;
                        /** Format: uuid */
                        candidate_id?: string;
                        candidate?: Record<string, never>;
                    };
                };
            };
        };
    };
    AuthController_registerOwner: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterOwnerDto"];
            };
        };
        responses: {
            /** @description OTP issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        dev_otp?: string;
                    };
                };
            };
        };
    };
    AuthController_verifyOwner: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyOtpDto"];
            };
        };
        responses: {
            /** @description Token issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        token?: string;
                        /** Format: uuid */
                        user_id?: string;
                    };
                };
            };
        };
    };
    AuthController_loginStartOwner: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginStartDto"];
            };
        };
        responses: {
            /** @description OTP issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        dev_otp?: string;
                    };
                };
            };
        };
    };
    AuthController_loginVerifyOwner: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyOtpDto"];
            };
        };
        responses: {
            /** @description Token issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        token?: string;
                        /** Format: uuid */
                        user_id?: string;
                    };
                };
            };
        };
    };
    AuthController_memberLogin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemberLoginDto"];
            };
        };
        responses: {
            /** @description Token issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        token?: string;
                        /** Format: uuid */
                        user_id?: string;
                        /** Format: uuid */
                        agency_id?: string;
                    };
                };
            };
        };
    };
    AuthController_memberLoginStart: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginStartDto"];
            };
        };
        responses: {
            /** @description OTP issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        dev_otp?: string;
                    };
                };
            };
        };
    };
    AuthController_memberLoginVerify: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyOtpDto"];
            };
        };
        responses: {
            /** @description Token issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        token?: string;
                        /** Format: uuid */
                        user_id?: string;
                        /** Format: uuid */
                        agency_id?: string;
                        user_type?: string;
                        phone?: string;
                        full_name?: string;
                    };
                };
            };
        };
    };
    AuthController_requestPhoneChange: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestPhoneChangeDto"];
            };
        };
        responses: {
            /** @description OTP sent to new phone number */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_verifyPhoneChange: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyPhoneChangeDto"];
            };
        };
        responses: {
            /** @description Phone number changed successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CandidateController_getCandidateProfile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Candidate profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CandidateProfileDto"];
                };
            };
        };
    };
    CandidateController_updateCandidateProfile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CandidateUpdateDto"];
            };
        };
        responses: {
            /** @description Updated candidate profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CandidateProfileDto"];
                };
            };
        };
    };
    CandidateController_getJobMobile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
                /** @description Job Posting ID */
                jobId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Mobile job projection */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileJobPostingDto"];
                };
            };
        };
    };
    CandidateController_createCandidate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CandidateCreateDto"];
            };
        };
        responses: {
            /** @description Candidate created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CandidateCreatedResponseDto"];
                };
            };
        };
    };
    CandidateController_getJobDetailsWithFitness: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
                /** @description Job Posting ID */
                jobId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Job details with fitness_score */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CandidateJobDetailsDto"];
                };
            };
        };
    };
    CandidateController_listJobProfiles: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Candidate job profiles */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CandidateJobProfileDto"][];
                };
            };
        };
    };
    CandidateController_updateJobProfile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        /** @description Partial update to job profile. Will create profile if none exists. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateJobProfileDto"];
            };
        };
        responses: {
            /** @description Job profile updated or created */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AddJobProfileResponseDto"];
                };
            };
        };
    };
    CandidateController_getRelevantJobs: {
        parameters: {
            query?: {
                /** @description AND|OR combination with preferences */
                combineWith?: "AND" | "OR";
                /** @description true|false */
                useCanonicalTitles?: string;
                /** @description true|false (defaults to true) */
                includeScore?: string;
                page?: string;
                limit?: string;
                /** @description Minimum salary amount */
                salary_min?: string;
                /** @description Maximum salary amount */
                salary_max?: string;
                /** @description Salary currency code */
                salary_currency?: string;
                /** @description base|converted */
                salary_source?: "base" | "converted";
                /** @description Single or multiple (CSV/array) country filter */
                country?: unknown;
            };
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated relevant jobs with fitness_score */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedJobsResponseDto"];
                };
            };
        };
    };
    CandidateController_getRelevantJobsGrouped: {
        parameters: {
            query?: {
                combineWith?: "AND" | "OR";
                useCanonicalTitles?: string;
                includeScore?: string;
                page?: string;
                limit?: string;
                salary_min?: string;
                salary_max?: string;
                salary_currency?: string;
                salary_source?: "base" | "converted";
                country?: unknown;
            };
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Grouped relevant jobs with fitness_score */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupedJobsResponseDto"];
                };
            };
        };
    };
    CandidateController_getRelevantJobsByTitle: {
        parameters: {
            query: {
                title: string;
                combineWith?: "AND" | "OR";
                useCanonicalTitles?: string;
                includeScore?: string;
                page?: string;
                limit?: string;
                salary_min?: string;
                salary_max?: string;
                salary_currency?: string;
                salary_source?: "base" | "converted";
                country?: unknown;
            };
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated relevant jobs for a single title with fitness_score */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedJobsResponseDto"];
                };
            };
        };
    };
    CandidateController_listInterviews: {
        parameters: {
            query?: {
                /** @description If true, returns only upcoming interviews (default: true). If false, returns all interviews. */
                only_upcoming?: boolean;
                /** @description Order of interviews. "upcoming" orders by date ascending (closest first), "recent" orders by date descending (most recent first). */
                order?: "upcoming" | "recent";
                /** @description Page number for pagination (default: 1) */
                page?: number;
                /** @description Number of items per page (default: 10, max: 100) */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated list of interviews */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedInterviewsDto"];
                };
            };
        };
    };
    CandidateController_listPreferences: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Ordered preferences */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreferenceDto"][];
                };
            };
        };
    };
    CandidateController_addPreference: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddPreferenceDto"];
            };
        };
        responses: {
            /** @description Preference added or moved to top */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreferenceDto"][];
                };
            };
        };
    };
    CandidateController_removePreference: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RemovePreferenceDto"];
            };
        };
        responses: {
            /** @description Updated preferences after removal */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreferenceDto"][];
                };
            };
        };
    };
    CandidateController_reorderPreferences: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReorderPreferencesDto"];
            };
        };
        responses: {
            /** @description Updated ordered preferences */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreferenceDto"][];
                };
            };
        };
    };
    CandidateController_uploadProfileImage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file?: string;
                };
            };
        };
        responses: {
            /** @description Profile image uploaded successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResponseDto"];
                };
            };
        };
    };
    CandidateController_deleteProfileImage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Profile image removed successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResponseDto"];
                };
            };
        };
    };
    CandidateController_listMediaImages: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of media files */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        files?: {
                            fileName?: string;
                            url?: string;
                            size?: number;
                            /** Format: date-time */
                            createdAt?: string;
                        }[];
                    };
                };
            };
        };
    };
    CandidateController_uploadMediaFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /**
                     * Format: binary
                     * @description File to upload (Images: JPEG, PNG, GIF, WebP | Documents: PDF, DOC, DOCX) - Max 10MB
                     */
                    file?: string;
                };
            };
        };
        responses: {
            /** @description File uploaded to media manager successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResponseDto"];
                };
            };
        };
    };
    CandidateController_listDocuments: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Document slots with upload status and summary */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentsWithSlotsResponseDto"];
                };
            };
        };
    };
    CandidateController_uploadDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                    /**
                     * Format: uuid
                     * @description Document type ID
                     */
                    document_type_id: string;
                    /** @description Document name */
                    name: string;
                    /** @description Document description */
                    description?: string;
                    /** @description Additional notes */
                    notes?: string;
                };
            };
        };
        responses: {
            /** @description Document uploaded successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CandidateDocumentResponseDto"];
                };
            };
        };
    };
    CandidateController_deleteDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Candidate ID */
                id: string;
                /** @description Document ID */
                documentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Document removed successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResponseDto"];
                };
            };
        };
    };
    DocumentTypeController_listDocumentTypes: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of available document types */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentTypeResponseDto"][];
                };
            };
        };
    };
    CountryController_list: {
        parameters: {
            query?: {
                /** @description Search by country name or code */
                search?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully retrieved countries */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CountryResponseDto"][];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CountryController_seedV1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully seeded countries */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SeedCountriesResponseDto"];
                };
            };
            /** @description Invalid seed data or file not found */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error during seeding */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SeedController_seedSystem: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Select which categories to seed. By default, countries and job titles are enabled; agencies and sample_postings are disabled. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["SeedRequestDto"];
            };
        };
        responses: {
            /** @description Seed operation completed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SeedCountsDto"];
                };
            };
        };
    };
    TesthelperController_findTestSuiteWorkflowPrerequisites: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Returns test suite prerequisites */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
            /** @description Required data not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TesthelperController_getAgenciesAnalytics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Returns list of agencies with analytics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown[];
                };
            };
        };
    };
    TesthelperController_getCandidates: {
        parameters: {
            query?: {
                /** @description Page number (default: 1) */
                page?: string;
                /** @description Items per page (default: 20) */
                limit?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Returns paginated list of candidates */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: {
                            id?: string;
                            phone?: string;
                            full_name?: string;
                        }[];
                        total?: number;
                        page?: number;
                        limit?: number;
                    };
                };
            };
        };
    };
    AdminJobsController_healthCheck: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminJobsController_getAdminJobs: {
        parameters: {
            query?: {
                /** @description Search across job title, company, ID */
                search?: string;
                /** @description Filter by country */
                country?: string;
                /** @description Filter by agency ID */
                agency_id?: string;
                /** @description Sort by field */
                sort_by?: "published_date" | "applications" | "shortlisted" | "interviews";
                /** @description Sort order */
                order?: "asc" | "desc";
                /** @description Page number */
                page?: number;
                /** @description Items per page */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Job listings with statistics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminJobListResponseDto"];
                };
            };
        };
    };
    AdminJobsController_getCountryDistribution: {
        parameters: {
            query?: {
                /** @description Filter by agency ID */
                agency_id?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Job count by country */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
}
