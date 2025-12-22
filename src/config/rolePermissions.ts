/**
 * Centralized Role Permissions Configuration
 * Single source of truth for all role-based permissions
 * 
 * Used by:
 * - Backend services (application.service.ts, domain.service.ts)
 * - Backend endpoints (auth.controller.ts)
 * - Frontend hooks (useActionPermission.js)
 */

export type UserRole = 'owner' | 'admin' | 'recruiter' | 'coordinator' | 'visa_officer' | 'viewer' | 'agency_user' | 'candidate' | 'call_agent';

/**
 * Role-based permission matrix
 * Maps each role to the actions they can perform
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: [
    // Application workflow
    'shortlist',
    'schedule_interview',
    'reschedule_interview',
    'complete_interview',
    'reject',
    'bulk_shortlist',
    'bulk_reject',
    'bulk_schedule',
    'multi_batch_schedule',
    // Document management
    'delete_document',
    'verify_document',
    // Notes
    'add_note',
    'edit_note',
    'delete_note',
    // Job management
    'create_job',
    'update_job',
    'publish_job',
    'close_job',
    'manage_positions',
    // Team management
    'manage_team',
    'manage_settings',
    // Reports
    'view_reports',
    'export_reports',
  ],
  admin: [
    // Application workflow
    'shortlist',
    'schedule_interview',
    'reschedule_interview',
    'complete_interview',
    'reject',
    'bulk_shortlist',
    'bulk_reject',
    'bulk_schedule',
    'multi_batch_schedule',
    // Document management
    'delete_document',
    'verify_document',
    // Notes
    'add_note',
    'edit_note',
    'delete_note',
    // Job management
    'create_job',
    'update_job',
    'publish_job',
    'close_job',
    'manage_positions',
    // Team management
    'manage_team',
    // Reports
    'view_reports',
    'export_reports',
  ],
  recruiter: [
    // Application workflow
    'shortlist',
    'schedule_interview',
    'reschedule_interview',
    'complete_interview',
    'reject',
    'bulk_shortlist',
    'bulk_reject',
    'bulk_schedule',
    'multi_batch_schedule',
    // Document management
    'delete_document',
    'verify_document',
    // Notes
    'add_note',
    'edit_note',
    'delete_note',
  ],
  coordinator: [
    // Interview workflow only
    'schedule_interview',
    'reschedule_interview',
    'complete_interview',
    // Notes
    'add_note',
    'edit_note',
    'delete_note',
  ],
  visa_officer: [
    // Document management
    'verify_document',
    'delete_document',
    // Application workflow (limited)
    'complete_interview',
    // Notes
    'add_note',
    'edit_note',
    'delete_note',
    // Reports
    'view_reports',
  ],
  viewer: [
    // No permissions - read-only access
  ],
  agency_user: [
    // Application workflow
    'shortlist',
    'schedule_interview',
    'reschedule_interview',
    'complete_interview',
    'reject',
    'bulk_shortlist',
    'bulk_reject',
    'bulk_schedule',
    'multi_batch_schedule',
    // Document management
    'delete_document',
    'verify_document',
    // Notes
    'add_note',
    'edit_note',
    'delete_note',
    // Job management
    'create_job',
    'update_job',
    'publish_job',
    'close_job',
    'manage_positions',
  ],
  candidate: [
    'withdraw',
  ],
  call_agent: [
    'schedule_interview',
    'reschedule_interview',
    'complete_interview',
    'add_note',
    'edit_note',
  ],
};

/**
 * Check if a role has permission for an action
 * @param role - User role
 * @param action - Action to check
 * @returns true if role has permission, false otherwise
 */
export function hasPermission(role: UserRole | null | undefined, action: string): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(action) : false;
}

/**
 * Get all actions for a role
 * @param role - User role
 * @returns Array of actions the role can perform
 */
export function getActionsForRole(role: UserRole | null | undefined): string[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get all roles that can perform an action
 * @param action - Action to check
 * @returns Array of roles that can perform the action
 */
export function getRolesForAction(action: string): UserRole[] {
  return (Object.entries(ROLE_PERMISSIONS) as [UserRole, string[]][])
    .filter(([_, actions]) => actions.includes(action))
    .map(([role, _]) => role);
}

/**
 * Check if a role is an agency member (owner, admin, recruiter, coordinator, visa_officer, viewer)
 * Used for scoping audit logs and data access
 * @param role - User role
 * @returns true if role is an agency member
 */
export function isAgencyMember(role: UserRole | null | undefined): boolean {
  if (!role) return false;
  const agencyRoles: UserRole[] = ['owner', 'admin', 'recruiter', 'coordinator', 'visa_officer', 'viewer'];
  return agencyRoles.includes(role);
}

/**
 * Check if a role is a system admin
 * @param role - User role
 * @returns true if role is admin
 */
export function isSystemAdmin(role: UserRole | null | undefined): boolean {
  return role === 'admin';
}

/**
 * Check if a role is a candidate
 * @param role - User role
 * @returns true if role is candidate
 */
export function isCandidate(role: UserRole | null | undefined): boolean {
  return role === 'candidate';
}
