import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { OwnerAnalyticsService } from './owner-analytics.service';
import { LandingStatsDto } from './dto/landing-stats.dto';

@ApiTags('analytics')
@Controller('analytics')
export class OwnerAnalyticsController {
  private cache: { data: LandingStatsDto | null; timestamp: number } = {
    data: null,
    timestamp: 0,
  };
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly analytics: OwnerAnalyticsService) {}

  @Get('landing-stats')
  @ApiOperation({
    summary: 'Get public landing page statistics',
    description: 'Returns platform statistics for public display. Cached for 5 minutes.',
  })
  @ApiOkResponse({
    description: 'Platform statistics',
    type: LandingStatsDto,
  })
  async getLandingStats(): Promise<LandingStatsDto> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.data && (now - this.cache.timestamp) < this.CACHE_TTL_MS) {
      return this.cache.data;
    }

    // Fetch fresh data
    const overview = await this.analytics.getPortalOverview();

    const stats: LandingStatsDto = {
      registered_agencies: overview.totals.agencies,
      active_job_openings: overview.totals.postings.active,
      cities_covered: overview.totals.countries,
      total_interviews: overview.totals.interviews,
      new_jobs_this_week: overview.recent_activity.new_postings_7d,
      successful_placements: overview.totals.successful_placements,
      generated_at: overview.generated_at,
    };

    // Update cache
    this.cache = {
      data: stats,
      timestamp: now,
    };

    return stats;
  }
}
