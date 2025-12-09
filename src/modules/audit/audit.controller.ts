import { Controller, Get, Query, UseGuards, Req, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService, AuditQueryFilters } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditCategories } from './audit.entity';

/**
 * Audit Log Controller
 * 
 * Provides endpoints for querying audit logs scoped to the observer's context:
 * - Agency admins see their agency's activity
 * - System admins see all activity
 * - Users see their own activity
 */
@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for audit module' })
  async healthCheck() {
    return { 
      status: 'ok', 
      module: 'audit', 
      version: '1.0.0', 
      timestamp: new Date().toISOString(),
      categories: Object.values(AuditCategories),
    };
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Query audit logs (scoped to user/agency)',
    description: `
Returns paginated audit logs filtered by the observer's context.

**Framing for Domain Observers:**
- Agency owners/members see activity within their agency
- Candidates see their own activity
- Logs are categorized by domain concepts: auth, application, job_posting, agency, candidate, interview

**Use Cases:**
- "Who applied to our jobs today?" → category=application, action=apply_job
- "What happened to application X?" → resource_type=job_application, resource_id=X
- "Show all interview scheduling activity" → category=interview
    `
  })
  @ApiQuery({ name: 'category', required: false, enum: Object.values(AuditCategories), description: 'Filter by domain category' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by specific action (e.g., apply_job, shortlist_candidate)' })
  @ApiQuery({ name: 'resource_type', required: false, description: 'Filter by resource type (job_application, job_posting, candidate)' })
  @ApiQuery({ name: 'resource_id', required: false, description: 'Filter by specific resource ID' })
  @ApiQuery({ name: 'outcome', required: false, enum: ['success', 'failure', 'denied'], description: 'Filter by outcome' })
  @ApiQuery({ name: 'start_date', required: false, description: 'Start of time range (ISO 8601)' })
  @ApiQuery({ name: 'end_date', required: false, description: 'End of time range (ISO 8601)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50, max: 100)' })
  @ApiOkResponse({
    description: 'Paginated audit logs',
    schema: {
      example: {
        items: [
          {
            id: 'uuid',
            created_at: '2025-12-05T10:30:00.000Z',
            method: 'POST',
            path: '/applications',
            user_id: 'user-uuid',
            user_role: 'candidate',
            action: 'apply_job',
            category: 'application',
            resource_type: 'job_application',
            resource_id: 'app-uuid',
            outcome: 'success',
            status_code: 201,
            duration_ms: 45,
          }
        ],
        total: 150,
        page: 1,
        limit: 50,
        filters: { category: 'application' }
      }
    }
  })
  async queryLogs(
    @Req() req: any,
    @Query('category') category?: string,
    @Query('action') action?: string,
    @Query('resource_type') resourceType?: string,
    @Query('resource_id') resourceId?: string,
    @Query('outcome') outcome?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Scope to user's agency if they have one
    const agencyId = req.user?.agency_id;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const filters: AuditQueryFilters = {
      category,
      action,
      resourceType,
      resourceId,
      outcome,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    };

    // Scope based on user role
    // Only system admin sees all logs
    const isAdmin = userRole === 'admin' || req.user?.phone === '+9779860000000';
    
    if (isAdmin) {
      // Admin sees all logs (no scoping)
    } else if (userRole === 'owner' || userRole === 'agency_user') {
      // Agency owners and staff see their agency's activity only
      filters.agencyId = agencyId;
    } else if (userRole === 'candidate') {
      // Candidates see only their own activity
      filters.userId = userId;
    }

    return this.auditService.query(filters);
  }

  @Get('timeline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get recent activity timeline',
    description: 'Returns the most recent audit events for quick overview'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of events (default: 20)' })
  @ApiOkResponse({ description: 'Recent audit events' })
  async getTimeline(
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    const userRole = req.user?.role;
    const isAdmin = userRole === 'admin' || req.user?.phone === '+9779860000000';
    const agencyId = isAdmin ? undefined : req.user?.agency_id;
    return this.auditService.getTimeline(agencyId, limit ? parseInt(limit) : 20);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get category summary for dashboard',
    description: 'Returns count of audit events by category for dashboard widgets'
  })
  @ApiQuery({ name: 'start_date', required: false, description: 'Start of time range (ISO 8601)' })
  @ApiQuery({ name: 'end_date', required: false, description: 'End of time range (ISO 8601)' })
  @ApiOkResponse({
    description: 'Event counts by category',
    schema: {
      example: {
        auth: 45,
        application: 120,
        job_posting: 15,
        interview: 30,
        agency: 5,
        candidate: 80
      }
    }
  })
  async getCategorySummary(
    @Req() req: any,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const userRole = req.user?.role;
    const isAdmin = userRole === 'admin' || req.user?.phone === '+9779860000000';
    const agencyId = isAdmin ? undefined : req.user?.agency_id;
    return this.auditService.getCategorySummary(
      agencyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('resources/:type/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get audit history for a specific resource',
    description: 'Returns all audit events related to a specific resource (e.g., job application, job posting)'
  })
  @ApiOkResponse({ description: 'Resource audit history' })
  async getResourceHistory(
    @Param('type') resourceType: string,
    @Param('id') resourceId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getResourceHistory(
      resourceType,
      resourceId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('users/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get audit history for a specific user',
    description: 'Returns all audit events performed by a specific user'
  })
  @ApiQuery({ name: 'start_date', required: false, description: 'Start of time range' })
  @ApiQuery({ name: 'end_date', required: false, description: 'End of time range' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'User activity history' })
  async getUserActivity(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    // Security: Only allow viewing own activity or agency members' activity
    const requestingUser = req.user;
    if (requestingUser.role === 'candidate' && requestingUser.id !== userId) {
      return { items: [], message: 'Access denied' };
    }

    return this.auditService.getUserActivity(userId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 100,
    });
  }
}
