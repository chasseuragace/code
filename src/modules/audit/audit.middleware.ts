import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuditService, AuditContext } from './audit.service';
import { AuditCategories, AuditActions } from './audit.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Route-to-Action mapping for automatic audit logging
 * Maps HTTP method + path pattern to audit action and category
 */
const ROUTE_MAPPINGS: Array<{
  method: string;
  pattern: RegExp;
  action: string;
  category: string;
  resourceType?: string;
  extractResourceId?: (params: Record<string, string>) => string | undefined;
}> = [
  // Auth - Candidate
  { method: 'POST', pattern: /^\/register$/, action: AuditActions.REGISTER, category: AuditCategories.AUTH },
  { method: 'POST', pattern: /^\/verify$/, action: AuditActions.LOGIN_VERIFY, category: AuditCategories.AUTH },
  { method: 'POST', pattern: /^\/login\/start$/, action: AuditActions.LOGIN_START, category: AuditCategories.AUTH },
  { method: 'POST', pattern: /^\/login\/verify$/, action: AuditActions.LOGIN_VERIFY, category: AuditCategories.AUTH },
  
  // Auth - Agency Owner
  { method: 'POST', pattern: /^\/agency\/register-owner$/, action: AuditActions.REGISTER, category: AuditCategories.AUTH },
  { method: 'POST', pattern: /^\/agency\/verify-owner$/, action: AuditActions.LOGIN_VERIFY, category: AuditCategories.AUTH },
  { method: 'POST', pattern: /^\/agency\/login\/start-owner$/, action: AuditActions.LOGIN_START, category: AuditCategories.AUTH },
  { method: 'POST', pattern: /^\/agency\/login\/verify-owner$/, action: AuditActions.LOGIN_VERIFY, category: AuditCategories.AUTH },
  
  // Auth - Agency Member
  { method: 'POST', pattern: /^\/member\/login$/, action: AuditActions.LOGIN_VERIFY, category: AuditCategories.AUTH },
  { method: 'POST', pattern: /^\/member\/login\/start$/, action: AuditActions.LOGIN_START, category: AuditCategories.AUTH },
  { method: 'POST', pattern: /^\/member\/login\/verify$/, action: AuditActions.LOGIN_VERIFY, category: AuditCategories.AUTH },

  // Applications
  { method: 'POST', pattern: /^\/applications$/, action: AuditActions.APPLY_JOB, category: AuditCategories.APPLICATION, resourceType: 'job_application' },
  { method: 'POST', pattern: /^\/applications\/([^/]+)\/shortlist$/, action: AuditActions.SHORTLIST_CANDIDATE, category: AuditCategories.APPLICATION, resourceType: 'job_application' },
  { method: 'POST', pattern: /^\/applications\/([^/]+)\/schedule-interview$/, action: AuditActions.SCHEDULE_INTERVIEW, category: AuditCategories.INTERVIEW, resourceType: 'job_application' },
  { method: 'POST', pattern: /^\/applications\/([^/]+)\/reschedule-interview$/, action: AuditActions.RESCHEDULE_INTERVIEW, category: AuditCategories.INTERVIEW, resourceType: 'job_application' },
  { method: 'POST', pattern: /^\/applications\/([^/]+)\/complete-interview$/, action: AuditActions.COMPLETE_INTERVIEW, category: AuditCategories.INTERVIEW, resourceType: 'job_application' },
  { method: 'POST', pattern: /^\/applications\/([^/]+)\/withdraw$/, action: AuditActions.WITHDRAW_APPLICATION, category: AuditCategories.APPLICATION, resourceType: 'job_application' },
  { method: 'POST', pattern: /^\/applications\/([^/]+)\/reject$/, action: AuditActions.REJECT_APPLICATION, category: AuditCategories.APPLICATION, resourceType: 'job_application' },

  // Job Postings
  { method: 'POST', pattern: /^\/agencies\/([^/]+)\/job-postings$/, action: AuditActions.CREATE_JOB_POSTING, category: AuditCategories.JOB_POSTING, resourceType: 'job_posting' },
  { method: 'PATCH', pattern: /^\/agencies\/([^/]+)\/job-postings\/([^/]+)$/, action: AuditActions.UPDATE_JOB_POSTING, category: AuditCategories.JOB_POSTING, resourceType: 'job_posting' },
  { method: 'PATCH', pattern: /^\/agencies\/([^/]+)\/job-postings\/([^/]+)\/tags$/, action: AuditActions.UPDATE_JOB_TAGS, category: AuditCategories.JOB_POSTING, resourceType: 'job_posting' },
  { method: 'PATCH', pattern: /^\/agencies\/([^/]+)\/job-postings\/([^/]+)\/toggle-draft$/, action: AuditActions.TOGGLE_JOB_POSTING_DRAFT, category: AuditCategories.JOB_POSTING, resourceType: 'job_posting' },
  { method: 'POST', pattern: /^\/agencies\/([^/]+)\/job-postings\/([^/]+)\/close$/, action: AuditActions.CLOSE_JOB_POSTING, category: AuditCategories.JOB_POSTING, resourceType: 'job_posting' },

  // Agency
  { method: 'POST', pattern: /^\/agencies$/, action: AuditActions.CREATE_AGENCY, category: AuditCategories.AGENCY, resourceType: 'agency' },
  { method: 'POST', pattern: /^\/agencies\/owner\/agency$/, action: AuditActions.CREATE_AGENCY, category: AuditCategories.AGENCY, resourceType: 'agency' },
  { method: 'PATCH', pattern: /^\/agencies\/([^/]+)$/, action: AuditActions.UPDATE_AGENCY, category: AuditCategories.AGENCY, resourceType: 'agency' },
  { method: 'PATCH', pattern: /^\/agencies\/owner\/agency\//, action: AuditActions.UPDATE_AGENCY, category: AuditCategories.AGENCY, resourceType: 'agency' },
  { method: 'POST', pattern: /^\/agencies\/([^/]+)\/members$/, action: AuditActions.ADD_TEAM_MEMBER, category: AuditCategories.AGENCY, resourceType: 'agency_user' },
  { method: 'POST', pattern: /^\/agencies\/owner\/members\/invite$/, action: AuditActions.ADD_TEAM_MEMBER, category: AuditCategories.AGENCY, resourceType: 'agency_user' },
  { method: 'POST', pattern: /^\/agencies\/owner\/members\/([^/]+)\/reset-password$/, action: AuditActions.ADD_TEAM_MEMBER, category: AuditCategories.AGENCY, resourceType: 'agency_user' },
  { method: 'PATCH', pattern: /^\/agencies\/owner\/members\/([^/]+)$/, action: AuditActions.ADD_TEAM_MEMBER, category: AuditCategories.AGENCY, resourceType: 'agency_user' },
  { method: 'PATCH', pattern: /^\/agencies\/owner\/members\/([^/]+)\/status$/, action: AuditActions.ADD_TEAM_MEMBER, category: AuditCategories.AGENCY, resourceType: 'agency_user' },
  { method: 'DELETE', pattern: /^\/agencies\/([^/]+)\/members\/([^/]+)$/, action: AuditActions.REMOVE_TEAM_MEMBER, category: AuditCategories.AGENCY, resourceType: 'agency_user' },
  { method: 'DELETE', pattern: /^\/agencies\/owner\/members\/([^/]+)$/, action: AuditActions.REMOVE_TEAM_MEMBER, category: AuditCategories.AGENCY, resourceType: 'agency_user' },
  
  // Agency Image Uploads
  { method: 'POST', pattern: /^\/agencies\/([^/]+)\/logo$/, action: AuditActions.UPDATE_AGENCY, category: AuditCategories.AGENCY, resourceType: 'agency' },
  { method: 'DELETE', pattern: /^\/agencies\/([^/]+)\/logo$/, action: AuditActions.UPDATE_AGENCY, category: AuditCategories.AGENCY, resourceType: 'agency' },
  { method: 'POST', pattern: /^\/agencies\/([^/]+)\/banner$/, action: AuditActions.UPDATE_AGENCY, category: AuditCategories.AGENCY, resourceType: 'agency' },
  { method: 'DELETE', pattern: /^\/agencies\/([^/]+)\/banner$/, action: AuditActions.UPDATE_AGENCY, category: AuditCategories.AGENCY, resourceType: 'agency' },

  // Candidate
  { method: 'POST', pattern: /^\/candidates$/, action: AuditActions.CREATE_PROFILE, category: AuditCategories.CANDIDATE, resourceType: 'candidate' },
  { method: 'PUT', pattern: /^\/candidates\/([^/]+)$/, action: AuditActions.UPDATE_PROFILE, category: AuditCategories.CANDIDATE, resourceType: 'candidate' },
  { method: 'PATCH', pattern: /^\/candidates\/([^/]+)$/, action: AuditActions.UPDATE_PROFILE, category: AuditCategories.CANDIDATE, resourceType: 'candidate' },
  { method: 'PUT', pattern: /^\/candidates\/([^/]+)\/job-profiles$/, action: AuditActions.UPDATE_JOB_PROFILE, category: AuditCategories.CANDIDATE, resourceType: 'candidate_job_profile' },

  // Candidate Documents
  { method: 'POST', pattern: /^\/agencies\/([^/]+)\/jobs\/([^/]+)\/candidates\/([^/]+)\/documents$/, action: AuditActions.UPLOAD_DOCUMENT, category: AuditCategories.CANDIDATE, resourceType: 'candidate_document' },
  { method: 'DELETE', pattern: /^\/agencies\/([^/]+)\/jobs\/([^/]+)\/candidates\/([^/]+)\/documents\/([^/]+)$/, action: AuditActions.DELETE_DOCUMENT, category: AuditCategories.CANDIDATE, resourceType: 'candidate_document' },
  { method: 'POST', pattern: /^\/agencies\/([^/]+)\/jobs\/([^/]+)\/candidates\/([^/]+)\/documents\/([^/]+)\/verify$/, action: AuditActions.VERIFY_DOCUMENT, category: AuditCategories.CANDIDATE, resourceType: 'candidate_document' },

  // Admin
  { method: 'POST', pattern: /^\/admin\/jobs\/bulk-reject$/, action: AuditActions.BULK_REJECT, category: AuditCategories.ADMIN, resourceType: 'job_posting' },

  // Application Notes
  { method: 'POST', pattern: /^\/application-notes$/, action: AuditActions.CREATE_NOTE, category: AuditCategories.APPLICATION, resourceType: 'application_note' },
  { method: 'PATCH', pattern: /^\/application-notes\/([^/]+)$/, action: AuditActions.UPDATE_NOTE, category: AuditCategories.APPLICATION, resourceType: 'application_note' },
  { method: 'DELETE', pattern: /^\/application-notes\/([^/]+)$/, action: AuditActions.DELETE_NOTE, category: AuditCategories.APPLICATION, resourceType: 'application_note' },
];

/**
 * Methods that should NOT be audited (read-only operations)
 * GETs are generally not audited unless part of sensitive workflows
 */
const SKIP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Paths that should never be audited (health checks, static assets, etc.)
 */
const SKIP_PATHS = [
  /^\/health/,
  /^\/docs/,
  /^\/public/,
  /^\/favicon/,
  /^\/_/,
];

export interface AuditableRequest extends Request {
  auditContext?: AuditContext;
  auditStartTime?: number;
  correlationId?: string;
  originalUrl: string;
  path: string;
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, any>;
  body: any;
  ip: string;
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(
    private readonly auditService: AuditService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: AuditableRequest, res: Response, next: NextFunction) {
    // Skip non-auditable requests
    if (this.shouldSkip(req)) {
      return next();
    }

    // Generate correlation ID
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    // Extract identity from Bearer token
    const identity = await this.extractIdentity(req);

    // Build audit context
    // Use originalUrl for the full path, fallback to path
    const requestPath = req.originalUrl?.split('?')[0] || req.path || req.url?.split('?')[0] || '/';
    
    const auditContext: AuditContext = {
      method: req.method,
      path: requestPath,
      correlationId,
      originIp: this.getClientIp(req),
      userAgent: (req.headers['user-agent'] as string) || undefined,
      ...identity,
    };

    req.auditContext = auditContext;
    req.auditStartTime = Date.now();

    // Capture response for audit logging
    const originalSend = res.send.bind(res);
    res.send = (body: any) => {
      this.logAuditEvent(req, res, body).catch(err => {
        console.error('[AuditMiddleware] Failed to log audit event:', err);
      });
      return originalSend(body);
    };

    next();
  }

  private shouldSkip(req: Request): boolean {
    // Skip read-only methods
    if (SKIP_METHODS.has(req.method)) {
      return true;
    }

    // Skip excluded paths
    for (const pattern of SKIP_PATHS) {
      if (pattern.test(req.path)) {
        return true;
      }
    }

    return false;
  }

  private async extractIdentity(req: Request): Promise<Partial<AuditContext>> {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    
    if (!auth || typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
      return { clientId: 'anonymous' };
    }

    try {
      const token = auth.slice('Bearer '.length);
      const payload = await this.jwtService.verifyAsync(token);
      
      return {
        userId: payload.sub,
        userEmail: payload.email,
        userRole: payload.role,
        agencyId: payload.aid || payload.agency_id,
        clientId: payload.client_id || 'web-app',
      };
    } catch {
      return { clientId: 'invalid-token' };
    }
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    }
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }

  private async logAuditEvent(
    req: AuditableRequest,
    res: Response,
    _body: any,
  ): Promise<void> {
    if (!req.auditContext) return;

    // Find matching route using the same path from audit context
    const requestPath = req.auditContext?.path || req.originalUrl?.split('?')[0] || req.path;
    const mapping = this.findRouteMapping(req.method, requestPath);
    
    if (!mapping) return; // No mapping = not auditable

    // Extract resource ID from path - only use if it looks like a UUID
    const match = requestPath.match(mapping.pattern);
    let resourceId: string | undefined;
    if (match && match.length > 1) {
      const lastCapture = match[match.length - 1];
      // Only use as resourceId if it looks like a UUID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(lastCapture)) {
        resourceId = lastCapture;
      }
    }

    const durationMs = req.auditStartTime ? Date.now() - req.auditStartTime : undefined;
    const isSuccess = res.statusCode >= 200 && res.statusCode < 400;

    try {
      await this.auditService.recordAuditEvent(
        req.auditContext,
        {
          action: mapping.action,
          category: mapping.category,
          resourceType: mapping.resourceType,
          resourceId,
          metadata: {
            query: req.query,
            bodyKeys: req.body ? Object.keys(req.body) : [],
          },
        },
        {
          outcome: isSuccess ? 'success' : (res.statusCode === 403 ? 'denied' : 'failure'),
          statusCode: res.statusCode,
          errorMessage: !isSuccess ? this.extractErrorMessage(_body) : undefined,
          durationMs,
        },
      );
    } catch (err) {
      console.error('[AuditMiddleware] Failed to save audit log:', err);
    }
  }

  private findRouteMapping(method: string, path: string) {
    return ROUTE_MAPPINGS.find(m => m.method === method && m.pattern.test(path));
  }

  private extractErrorMessage(body: any): string | undefined {
    if (!body) return undefined;
    try {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body;
      return parsed.message || parsed.error || undefined;
    } catch {
      return undefined;
    }
  }
}
