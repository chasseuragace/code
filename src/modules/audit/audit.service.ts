import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, FindOptionsWhere, ILike } from 'typeorm';
import { AuditLog, AuditCategory, AuditAction, AuditActionDescriptions, AuditCategoryLabels } from './audit.entity';

export interface AuditContext {
  // Request frame
  method: string;
  path: string;
  correlationId?: string;
  originIp?: string;
  userAgent?: string;
  
  // Identity frame (extracted from Bearer token)
  userId?: string;
  userEmail?: string;
  userRole?: string;
  agencyId?: string;
  clientId?: string;
}

export interface AuditActivity {
  action: AuditAction | string;
  category: AuditCategory | string;
  resourceType?: string;
  resourceId?: string;
  stateChange?: Record<string, [any, any]>; // { field: [old, new] }
  metadata?: Record<string, any>;
}

export interface AuditOutcome {
  outcome: 'success' | 'failure' | 'denied';
  statusCode?: number;
  errorMessage?: string;
  durationMs?: number;
}

export interface AuditQueryFilters {
  userId?: string;
  agencyId?: string;
  category?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  outcome?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogWithDescription extends AuditLog {
  description: string;
  category_label: string;
}

export interface AuditQueryResult {
  items: AuditLogWithDescription[];
  total: number;
  page: number;
  limit: number;
  filters: Partial<AuditQueryFilters>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event
   */
  async log(
    context: AuditContext,
    activity: AuditActivity,
    outcome: AuditOutcome,
  ): Promise<AuditLog> {
    const entry = this.auditRepo.create({
      // Request frame
      method: context.method,
      path: context.path,
      correlation_id: context.correlationId || null,
      origin_ip: context.originIp || null,
      user_agent: context.userAgent || null,
      
      // Identity frame
      user_id: context.userId || null,
      user_email: context.userEmail || null,
      user_role: context.userRole || null,
      agency_id: context.agencyId || null,
      client_id: context.clientId || null,
      
      // Activity frame
      action: activity.action,
      category: activity.category,
      resource_type: activity.resourceType || null,
      resource_id: activity.resourceId || null,
      state_change: activity.stateChange || null,
      metadata: activity.metadata || null,
      
      // Outcome
      outcome: outcome.outcome,
      status_code: outcome.statusCode || null,
      error_message: outcome.errorMessage || null,
      duration_ms: outcome.durationMs || null,
    });

    return this.auditRepo.save(entry);
  }

  /**
   * Query audit logs with filters and pagination
   */
  async query(filters: AuditQueryFilters): Promise<AuditQueryResult> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<AuditLog> = {};

    if (filters.userId) where.user_id = filters.userId;
    if (filters.agencyId) where.agency_id = filters.agencyId;
    if (filters.category) where.category = filters.category;
    if (filters.action) where.action = filters.action;
    if (filters.resourceType) where.resource_type = filters.resourceType;
    if (filters.resourceId) where.resource_id = filters.resourceId;
    if (filters.outcome) where.outcome = filters.outcome;

    if (filters.startDate && filters.endDate) {
      where.created_at = Between(filters.startDate, filters.endDate);
    }

    const [rawItems, total] = await this.auditRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    // Add human-readable descriptions
    const items = rawItems.map(item => this.enrichWithDescription(item));

    return {
      items,
      total,
      page,
      limit,
      filters: {
        userId: filters.userId,
        agencyId: filters.agencyId,
        category: filters.category,
        action: filters.action,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
    };
  }

  /**
   * Enrich audit log with human-readable description
   */
  private enrichWithDescription(log: AuditLog): AuditLogWithDescription {
    return {
      ...log,
      description: AuditActionDescriptions[log.action] || this.generateDescription(log),
      category_label: AuditCategoryLabels[log.category] || log.category,
    };
  }

  /**
   * Generate a fallback description from action name
   */
  private generateDescription(log: AuditLog): string {
    // Convert action like 'create_job_posting' to 'Create job posting'
    const words = log.action.split('_');
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ');
  }

  /**
   * Get audit logs for a specific resource
   */
  async getResourceHistory(
    resourceType: string,
    resourceId: string,
    limit = 50,
  ): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { resource_type: resourceType, resource_id: resourceId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserActivity(
    userId: string,
    options: { startDate?: Date; endDate?: Date; limit?: number } = {},
  ): Promise<AuditLog[]> {
    const where: FindOptionsWhere<AuditLog> = { user_id: userId };
    
    if (options.startDate && options.endDate) {
      where.created_at = Between(options.startDate, options.endDate);
    }

    return this.auditRepo.find({
      where,
      order: { created_at: 'DESC' },
      take: options.limit || 100,
    });
  }

  /**
   * Get category summary for dashboard
   */
  async getCategorySummary(
    agencyId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Record<string, number>> {
    let query = this.auditRepo
      .createQueryBuilder('audit')
      .select('audit.category', 'category')
      .addSelect('COUNT(*)', 'count');

    if (agencyId) {
      query = query.where('audit.agency_id = :agencyId', { agencyId });
    }

    if (startDate && endDate) {
      query = query.andWhere('audit.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }

    const results = await query.groupBy('audit.category').getRawMany();

    return results.reduce((acc, r) => {
      acc[r.category] = parseInt(r.count);
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get recent activity timeline
   */
  async getTimeline(
    agencyId?: string,
    limit = 20,
  ): Promise<AuditLogWithDescription[]> {
    const where: FindOptionsWhere<AuditLog> = {};
    if (agencyId) where.agency_id = agencyId;

    const rawItems = await this.auditRepo.find({
      where,
      order: { created_at: 'DESC' },
      take: limit,
    });

    return rawItems.map(item => this.enrichWithDescription(item));
  }

  /**
   * Get resource history with descriptions
   */
  async getResourceHistoryEnriched(
    resourceType: string,
    resourceId: string,
    limit = 50,
  ): Promise<AuditLogWithDescription[]> {
    const rawItems = await this.getResourceHistory(resourceType, resourceId, limit);
    return rawItems.map(item => this.enrichWithDescription(item));
  }
}
