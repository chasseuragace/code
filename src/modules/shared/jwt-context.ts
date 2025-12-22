/**
 * JWT Context Extractor
 * Utilities for extracting and validating JWT payload data
 */

export interface JwtPayload {
  sub: string; // user_id
  aid?: string | null; // agency_id (optional, for members/owners)
  cid?: string; // candidate_id (optional, for candidates)
  role: 'candidate' | 'agency_user' | 'owner' | 'call_agent';
  iat?: number;
  exp?: number;
}

export class JwtContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JwtContextError';
  }
}

/**
 * Extract and validate JWT payload from request
 */
export function extractJwtPayload(user: any): JwtPayload {
  if (!user) {
    throw new JwtContextError('No user context found in request');
  }

  if (!user.sub) {
    throw new JwtContextError('Invalid JWT: missing sub (user_id)');
  }

  if (!user.role) {
    throw new JwtContextError('Invalid JWT: missing role');
  }

  return {
    sub: user.sub,
    aid: user.aid || null,
    cid: user.cid || undefined,
    role: user.role,
    iat: user.iat,
    exp: user.exp,
  };
}

/**
 * Validate that user has agency context (for agency_user or owner roles)
 */
export function validateAgencyContext(payload: JwtPayload): string {
  if (!payload.aid) {
    throw new JwtContextError(`User role '${payload.role}' requires agency_id (aid) in JWT`);
  }
  return payload.aid;
}

/**
 * Validate that user is an agency member (agency_user role)
 */
export function validateMemberRole(payload: JwtPayload): void {
  if (payload.role !== 'agency_user') {
    throw new JwtContextError(`Expected role 'agency_user', got '${payload.role}'`);
  }
}

/**
 * Validate that user is an agency owner
 */
export function validateOwnerRole(payload: JwtPayload): void {
  if (payload.role !== 'owner') {
    throw new JwtContextError(`Expected role 'owner', got '${payload.role}'`);
  }
}

/**
 * Validate that user is a candidate
 */
export function validateCandidateRole(payload: JwtPayload): void {
  if (payload.role !== 'candidate') {
    throw new JwtContextError(`Expected role 'candidate', got '${payload.role}'`);
  }
}
