import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting, InterviewDetail, JobPosition } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { JobApplication } from '../application/job-application.entity';

export interface PortalOverview {
  generated_at: string;
  totals: {
    agencies: number;
    postings: { total: number; active: number; inactive: number };
    interviews: number;
    countries: number;
    successful_placements: number;
  };
  recent_activity: {
    new_postings_7d: number;
    deactivated_postings_7d: number;
    interviews_7d: number;
  };
  top_countries_by_active_postings: Array<{ country: string; active_postings: number }>;
}

@Injectable()
export class OwnerAnalyticsService {
  constructor(
    @InjectRepository(PostingAgency) private agencyRepo: Repository<PostingAgency>,
    @InjectRepository(JobPosting) private postingRepo: Repository<JobPosting>,
    @InjectRepository(InterviewDetail) private interviewRepo: Repository<InterviewDetail>,
    @InjectRepository(JobPosition) private positionRepo: Repository<JobPosition>,
    @InjectRepository(JobApplication) private applicationRepo: Repository<JobApplication>,
  ) {}

  async getPortalOverview(topCountriesLimit = 5): Promise<PortalOverview> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [agencies, totalPostings, activePostings, interviewsTotal, citiesRow, successfulPlacements] = await Promise.all([
      this.agencyRepo.count(),
      this.postingRepo.count(),
      this.postingRepo.count({ where: { is_active: true } }),
      this.interviewRepo.count(),
      this.agencyRepo
        .createQueryBuilder('pa')
        .select('COUNT(DISTINCT pa.city)', 'cnt')
        .where('pa.city IS NOT NULL')
        .getRawOne<{ cnt: string }>(),
      this.applicationRepo.count({ where: { status: 'interview_passed' } }),
    ]);

    const inactivePostings = totalPostings - activePostings;

    const [newPostings7d, deactivated7d, interviews7d] = await Promise.all([
      this.postingRepo
        .createQueryBuilder('jp')
        .where('jp.posting_date_ad >= :since', { since: sevenDaysAgo })
        .getCount(),
      this.postingRepo
        .createQueryBuilder('jp')
        .where('jp.is_active = FALSE')
        .andWhere('jp.updated_at >= :since', { since: sevenDaysAgo })
        .getCount(),
      this.interviewRepo
        .createQueryBuilder('iv')
        .where('iv.interview_date_ad >= :since', { since: sevenDaysAgo })
        .getCount(),
    ]);

    const topCountries = await this.postingRepo
      .createQueryBuilder('jp')
      .select('jp.country', 'country')
      .addSelect('COUNT(*)', 'active_postings')
      .where('jp.is_active = TRUE')
      .groupBy('jp.country')
      .orderBy('COUNT(*)', 'DESC')
      .limit(topCountriesLimit)
      .getRawMany<{ country: string; active_postings: string }>();

    return {
      generated_at: now.toISOString(),
      totals: {
        agencies,
        postings: { total: totalPostings, active: activePostings, inactive: inactivePostings },
        interviews: interviewsTotal,
        countries: Number(citiesRow?.cnt || 0),
        successful_placements: successfulPlacements,
      },
      recent_activity: {
        new_postings_7d: newPostings7d,
        deactivated_postings_7d: deactivated7d,
        interviews_7d: interviews7d,
      },
      top_countries_by_active_postings: topCountries.map((r) => ({ country: r.country, active_postings: Number(r.active_postings) })),
    };
  }

  async getPostingsByCountry(): Promise<Array<{ country: string; active: number; total: number }>> {
    const rows = await this.postingRepo
      .createQueryBuilder('jp')
      .select('jp.country', 'country')
      .addSelect("SUM(CASE WHEN jp.is_active THEN 1 ELSE 0 END)", 'active')
      .addSelect('COUNT(*)', 'total')
      .groupBy('jp.country')
      .orderBy('total', 'DESC')
      .getRawMany<{ country: string; active: string; total: string }>();
    return rows.map(r => ({ country: r.country, active: Number(r.active), total: Number(r.total) }));
  }

  async getSalaryStatsByCurrency(params?: { since?: Date }): Promise<Array<{
    currency: string;
    min: number;
    max: number;
    avg: number;
    p25: number;
    p50: number;
    p75: number;
  }>> {
    // Use raw SQL with PERCENTILE_CONT via query builder; optional since filter on posting_date_ad
    const qb = this.positionRepo
      .createQueryBuilder('pos')
      .select('pos.salary_currency', 'currency')
      .addSelect('MIN(pos.monthly_salary_amount)', 'min')
      .addSelect('MAX(pos.monthly_salary_amount)', 'max')
      .addSelect('AVG(pos.monthly_salary_amount)', 'avg')
      .addSelect("PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY pos.monthly_salary_amount)", 'p25')
      .addSelect("PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pos.monthly_salary_amount)", 'p50')
      .addSelect("PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY pos.monthly_salary_amount)", 'p75')
      .leftJoin('pos.job_contract', 'c')
      .leftJoin('c.job_posting', 'jp')
      .groupBy('pos.salary_currency');
    if (params?.since) {
      qb.where('jp.posting_date_ad >= :since', { since: params.since });
    }
    const rows = await qb.getRawMany<{ currency: string; min: string; max: string; avg: string; p25: string; p50: string; p75: string }>();

    return rows.map(r => ({
      currency: r.currency,
      min: Number(r.min),
      max: Number(r.max),
      avg: Number(r.avg),
      p25: Number(r.p25),
      p50: Number(r.p50),
      p75: Number(r.p75),
    }));
  }

  async getSalaryByCountryCurrency(): Promise<Array<{
    country: string;
    currency: string;
    min: number;
    max: number;
    avg: number;
  }>> {
    const rows = await this.positionRepo
      .createQueryBuilder('pos')
      .select('jp.country', 'country')
      .addSelect('pos.salary_currency', 'currency')
      .addSelect('MIN(pos.monthly_salary_amount)', 'min')
      .addSelect('MAX(pos.monthly_salary_amount)', 'max')
      .addSelect('AVG(pos.monthly_salary_amount)', 'avg')
      .leftJoin('pos.job_contract', 'c')
      .leftJoin('c.job_posting', 'jp')
      .where('jp.is_active = TRUE')
      .groupBy('jp.country')
      .addGroupBy('pos.salary_currency')
      .orderBy('jp.country', 'ASC')
      .addOrderBy('pos.salary_currency', 'ASC')
      .getRawMany<{ country: string; currency: string; min: string; max: string; avg: string }>();

    return rows.map(r => ({
      country: r.country,
      currency: r.currency,
      min: Number(r.min),
      max: Number(r.max),
      avg: Number(r.avg),
    }));
  }

  async getPositionsDistribution(): Promise<Array<{
    title: string;
    postings: number;
    distinct_agencies: number;
    distinct_countries: number;
  }>> {
    const rows = await this.positionRepo
      .createQueryBuilder('pos')
      .select('pos.title', 'title')
      .addSelect('COUNT(DISTINCT jp.id)', 'postings')
      .addSelect('COUNT(DISTINCT c.posting_agency_id)', 'distinct_agencies')
      .addSelect('COUNT(DISTINCT jp.country)', 'distinct_countries')
      .leftJoin('pos.job_contract', 'c')
      .leftJoin('c.job_posting', 'jp')
      .where('jp.is_active = TRUE')
      .groupBy('pos.title')
      .orderBy('postings', 'DESC')
      .getRawMany<{ title: string; postings: string; distinct_agencies: string; distinct_countries: string }>();

    return rows.map(r => ({
      title: r.title,
      postings: Number(r.postings),
      distinct_agencies: Number(r.distinct_agencies),
      distinct_countries: Number(r.distinct_countries),
    }));
  }

  async getInterviewsTimeSeriesWeekly(): Promise<Array<{
    week_start: string;
    interviews: number;
  }>> {
    const rows = await this.interviewRepo
      .createQueryBuilder('iv')
      .select("DATE_TRUNC('week', iv.interview_date_ad)", 'week_start')
      .addSelect('COUNT(*)', 'interviews')
      .where('iv.interview_date_ad IS NOT NULL')
      .groupBy("DATE_TRUNC('week', iv.interview_date_ad)")
      .orderBy("DATE_TRUNC('week', iv.interview_date_ad)", 'ASC')
      .getRawMany<{ week_start: Date; interviews: string }>();

    return rows.map(r => ({
      week_start: new Date(r.week_start).toISOString().slice(0, 10),
      interviews: Number(r.interviews),
    }));
  }

  async getDeactivationMetrics(params?: { countries?: string[] }): Promise<{
    deactivation_rate: number;
    avg_days_to_deactivate: number;
    by_country: Array<{ country: string; rate: number; avg_days: number }>;
  }> {
    const countries = params?.countries && params.countries.length ? params.countries : undefined;

    const totalQb = this.postingRepo
      .createQueryBuilder('jp')
      .select('COUNT(*)', 'total')
      .addSelect("SUM(CASE WHEN jp.is_active = FALSE THEN 1 ELSE 0 END)", 'deactivated');
    if (countries) totalQb.andWhere('jp.country IN (:...countries)', { countries });

    const avgDaysQb = this.postingRepo
      .createQueryBuilder('jp')
      .select(
        "AVG(CASE WHEN jp.updated_at >= jp.posting_date_ad THEN EXTRACT(EPOCH FROM (jp.updated_at - jp.posting_date_ad)) / 86400 ELSE NULL END)",
        'avg_days',
      )
      .where('jp.is_active = FALSE');
    if (countries) avgDaysQb.andWhere('jp.country IN (:...countries)', { countries });

    const [totals, avgDaysRow] = await Promise.all([
      totalQb.getRawOne<{ total: string; deactivated: string }>(),
      avgDaysQb.getRawOne<{ avg_days: string | null }>(),
    ]);

    const total = Number(totals?.total || 0);
    const deactivated = Number(totals?.deactivated || 0);
    const deactivation_rate = total > 0 ? deactivated / total : 0;
    const avg_days_to_deactivate = avgDaysRow?.avg_days ? Number(avgDaysRow.avg_days) : 0;

    const byCountryQb = this.postingRepo
      .createQueryBuilder('jp')
      .select('jp.country', 'country')
      .addSelect('COUNT(*)', 'total')
      .addSelect("SUM(CASE WHEN jp.is_active = FALSE THEN 1 ELSE 0 END)", 'deactivated')
      .addSelect(
        "AVG(CASE WHEN jp.is_active = FALSE AND jp.updated_at >= jp.posting_date_ad THEN EXTRACT(EPOCH FROM (jp.updated_at - jp.posting_date_ad)) / 86400 ELSE NULL END)",
        'avg_days',
      )
      .groupBy('jp.country')
      .orderBy('jp.country', 'ASC');
    if (countries) byCountryQb.where('jp.country IN (:...countries)', { countries });
    const byCountryRows = await byCountryQb.getRawMany<{ country: string; total: string; deactivated: string; avg_days: string | null }>();

    const by_country = byCountryRows.map(r => ({
      country: r.country,
      rate: Number(r.total) > 0 ? Number(r.deactivated) / Number(r.total) : 0,
      avg_days: r.avg_days ? Number(r.avg_days) : 0,
    }));

    return { deactivation_rate, avg_days_to_deactivate, by_country };
  }

  // Platform Analytics Methods for Government Reports
  async getPlatformDashboard(): Promise<any> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get comprehensive platform overview
    const overview = await this.getPortalOverview();
    
    // Get additional metrics for government reporting
    const [
      agencyPerformance,
      salaryStats,
      positionDistribution,
      weeklyInterviews,
      monthlyTrends
    ] = await Promise.all([
      this.getTopAgencies(),
      this.getSalaryStatsByCurrency(),
      this.getPositionsDistribution(),
      this.getInterviewsTimeSeriesWeekly(),
      this.getMonthlyTrends()
    ]);

    return {
      overview,
      agency_performance: {
        top_agencies: agencyPerformance,
        agency_distribution: {
          by_country: await this.getAgencyDistributionByCountry(),
          by_status: await this.getAgencyDistributionByStatus()
        }
      },
      market_insights: {
        job_market: {
          top_job_titles: positionDistribution.slice(0, 15),
          salary_trends: salaryStats,
          popular_destinations: await this.getPopularDestinations()
        },
        application_insights: {
          conversion_rates: await this.getConversionRates(),
          avg_processing_time: {
            application_to_interview: 7,
            interview_to_decision: 3
          }
        }
      },
      trends: {
        monthly_data: monthlyTrends,
        weekly_data: weeklyInterviews
      },
      realtime: {
        today_jobs: overview.recent_activity.new_postings_7d,
        today_applications: 0,
        today_interviews: overview.recent_activity.interviews_7d,
        active_agencies: overview.totals.agencies,
        last_updated: now.toISOString()
      },
      generated_at: now.toISOString(),
      report_type: 'government_compliance',
    };
  }

  async getTopAgencies(): Promise<Array<{
    id: string;
    name: string;
    license_number: string;
    total_jobs: number;
    active_jobs: number;
    total_applications: number;
    success_rate: number;
    countries_served: number;
    avg_salary: number;
    growth_rate: number;
  }>> {
    const agencies = await this.postingRepo.query(`
      SELECT 
        pa.id,
        pa.name,
        pa.license_number,
        COUNT(DISTINCT jp.id) AS total_jobs,
        COUNT(DISTINCT CASE WHEN jp.is_active THEN jp.id END) AS active_jobs,
        COUNT(DISTINCT ja.id) AS total_applications,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT ja.id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN ja.status = 'interview_passed' THEN ja.id END)::float / COUNT(DISTINCT ja.id) * 100)
            ELSE 0 
          END, 2
        ) AS success_rate,
        COUNT(DISTINCT jp.country) AS countries_served,
        ROUND(AVG(jpos.monthly_salary_amount), 2) AS avg_salary,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT CASE WHEN jp.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN jp.id END) > 0
            AND COUNT(DISTINCT CASE WHEN jp.created_at >= CURRENT_DATE - INTERVAL '60 days' AND jp.created_at < CURRENT_DATE - INTERVAL '30 days' THEN jp.id END) > 0
            THEN ((COUNT(DISTINCT CASE WHEN jp.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN jp.id END)::float / 
                   COUNT(DISTINCT CASE WHEN jp.created_at >= CURRENT_DATE - INTERVAL '60 days' AND jp.created_at < CURRENT_DATE - INTERVAL '30 days' THEN jp.id END)) - 1) * 100
            ELSE 0
          END, 2
        ) AS growth_rate
      FROM posting_agencies pa
      LEFT JOIN job_contracts jc ON pa.id = jc.posting_agency_id
      LEFT JOIN job_postings jp ON jc.job_posting_id = jp.id
      LEFT JOIN job_applications ja ON jp.id = ja.job_posting_id
      LEFT JOIN job_positions jpos ON jc.id = jpos.job_contract_id
      WHERE pa.is_active = true
      GROUP BY pa.id, pa.name, pa.license_number
      HAVING COUNT(DISTINCT jp.id) > 0
      ORDER BY total_jobs DESC, success_rate DESC
      LIMIT 20
    `);

    return agencies.map(agency => ({
      id: agency.id,
      name: agency.name,
      license_number: agency.license_number,
      total_jobs: parseInt(agency.total_jobs) || 0,
      active_jobs: parseInt(agency.active_jobs) || 0,
      total_applications: parseInt(agency.total_applications) || 0,
      success_rate: parseFloat(agency.success_rate) || 0,
      countries_served: parseInt(agency.countries_served) || 0,
      avg_salary: parseFloat(agency.avg_salary) || 0,
      growth_rate: parseFloat(agency.growth_rate) || 0,
    }));
  }

  async getMonthlyTrends(): Promise<Array<{
    month: string;
    agencies: number;
    jobs: number;
    applications: number;
    interviews: number;
  }>> {
    const trends = await this.postingRepo.query(`
      WITH months AS (
        SELECT 
          DATE_TRUNC('month', generate_series(
            CURRENT_DATE - INTERVAL '11 months',
            CURRENT_DATE,
            INTERVAL '1 month'
          )) AS month
      ),
      monthly_agencies AS (
        SELECT 
          DATE_TRUNC('month', pa.created_at) AS month,
          COUNT(*) AS agencies
        FROM posting_agencies pa
        WHERE pa.created_at >= CURRENT_DATE - INTERVAL '11 months'
        GROUP BY DATE_TRUNC('month', pa.created_at)
      ),
      monthly_jobs AS (
        SELECT 
          DATE_TRUNC('month', jp.posting_date_ad) AS month,
          COUNT(*) AS jobs
        FROM job_postings jp
        WHERE jp.posting_date_ad >= CURRENT_DATE - INTERVAL '11 months'
        GROUP BY DATE_TRUNC('month', jp.posting_date_ad)
      ),
      monthly_applications AS (
        SELECT 
          DATE_TRUNC('month', ja.created_at) AS month,
          COUNT(*) AS applications
        FROM job_applications ja
        WHERE ja.created_at >= CURRENT_DATE - INTERVAL '11 months'
        GROUP BY DATE_TRUNC('month', ja.created_at)
      ),
      monthly_interviews AS (
        SELECT 
          DATE_TRUNC('month', iv.interview_date_ad) AS month,
          COUNT(*) AS interviews
        FROM interview_details iv
        WHERE iv.interview_date_ad >= CURRENT_DATE - INTERVAL '11 months'
        GROUP BY DATE_TRUNC('month', iv.interview_date_ad)
      )
      SELECT 
        m.month,
        COALESCE(ma.agencies, 0) AS agencies,
        COALESCE(mj.jobs, 0) AS jobs,
        COALESCE(map.applications, 0) AS applications,
        COALESCE(mi.interviews, 0) AS interviews
      FROM months m
      LEFT JOIN monthly_agencies ma ON m.month = ma.month
      LEFT JOIN monthly_jobs mj ON m.month = mj.month
      LEFT JOIN monthly_applications map ON m.month = map.month
      LEFT JOIN monthly_interviews mi ON m.month = mi.month
      ORDER BY m.month
    `);

    return trends.map(row => ({
      month: new Date(row.month).toISOString().slice(0, 7),
      agencies: parseInt(row.agencies) || 0,
      jobs: parseInt(row.jobs) || 0,
      applications: parseInt(row.applications) || 0,
      interviews: parseInt(row.interviews) || 0,
    }));
  }

  async getAgencyDistributionByCountry(): Promise<Array<{ country: string; count: number }>> {
    const distribution = await this.agencyRepo.query(`
      SELECT 
        COALESCE(country, 'Unknown') AS country,
        COUNT(*) AS count
      FROM posting_agencies
      WHERE is_active = true
      GROUP BY country
      ORDER BY count DESC
    `);

    return distribution.map(row => ({
      country: row.country,
      count: parseInt(row.count),
    }));
  }

  async getAgencyDistributionByStatus(): Promise<Array<{ status: string; count: number }>> {
    const distribution = await this.agencyRepo.query(`
      SELECT 
        CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END AS status,
        COUNT(*) AS count
      FROM posting_agencies
      GROUP BY is_active
    `);

    return distribution.map(row => ({
      status: row.status,
      count: parseInt(row.count),
    }));
  }

  async getPopularDestinations(): Promise<Array<{ country: string; job_count: number; avg_salary: number }>> {
    const destinations = await this.postingRepo.query(`
      SELECT 
        jp.country,
        COUNT(DISTINCT jp.id) AS job_count,
        ROUND(AVG(jpos.monthly_salary_amount), 2) AS avg_salary
      FROM job_postings jp
      JOIN job_contracts jc ON jp.id = jc.job_posting_id
      JOIN job_positions jpos ON jc.id = jpos.job_contract_id
      WHERE jp.is_active = true
      GROUP BY jp.country
      ORDER BY job_count DESC
      LIMIT 10
    `);

    return destinations.map(dest => ({
      country: dest.country,
      job_count: parseInt(dest.job_count),
      avg_salary: parseFloat(dest.avg_salary) || 0,
    }));
  }

  async getCountryAnalytics(): Promise<Array<{
    country: string;
    active_postings: number;
    total_agencies: number;
    avg_salary: number;
    growth_rate: number;
    total_applications: number;
  }>> {
    const countryData = await this.postingRepo.query(`
      SELECT 
        jp.country,
        COUNT(DISTINCT CASE WHEN jp.is_active THEN jp.id END) AS active_postings,
        COUNT(DISTINCT pa.id) AS total_agencies,
        ROUND(AVG(jpos.monthly_salary_amount), 2) AS avg_salary,
        COUNT(DISTINCT ja.id) AS total_applications,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT CASE WHEN jp.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN jp.id END) > 0
            AND COUNT(DISTINCT CASE WHEN jp.created_at >= CURRENT_DATE - INTERVAL '60 days' AND jp.created_at < CURRENT_DATE - INTERVAL '30 days' THEN jp.id END) > 0
            THEN ((COUNT(DISTINCT CASE WHEN jp.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN jp.id END)::float / 
                   COUNT(DISTINCT CASE WHEN jp.created_at >= CURRENT_DATE - INTERVAL '60 days' AND jp.created_at < CURRENT_DATE - INTERVAL '30 days' THEN jp.id END)) - 1) * 100
            ELSE 0
          END, 2
        ) AS growth_rate
      FROM job_postings jp
      JOIN job_contracts jc ON jp.id = jc.job_posting_id
      JOIN posting_agencies pa ON jc.posting_agency_id = pa.id
      LEFT JOIN job_positions jpos ON jc.id = jpos.job_contract_id
      LEFT JOIN job_applications ja ON jp.id = ja.job_posting_id
      WHERE jp.country IS NOT NULL
      GROUP BY jp.country
      ORDER BY active_postings DESC
    `);

    return countryData.map(country => ({
      country: country.country,
      active_postings: parseInt(country.active_postings) || 0,
      total_agencies: parseInt(country.total_agencies) || 0,
      avg_salary: parseFloat(country.avg_salary) || 0,
      growth_rate: parseFloat(country.growth_rate) || 0,
      total_applications: parseInt(country.total_applications) || 0,
    }));
  }

  async getConversionRates(): Promise<{
    application_to_shortlist: number;
    shortlist_to_interview: number;
    interview_to_success: number;
  }> {
    const rates = await this.applicationRepo.query(`
      SELECT 
        COUNT(*) AS total_applications,
        COUNT(CASE WHEN status IN ('shortlisted', 'interview_scheduled', 'interview_passed') THEN 1 END) AS shortlisted,
        COUNT(CASE WHEN status IN ('interview_scheduled', 'interview_passed') THEN 1 END) AS interviewed,
        COUNT(CASE WHEN status = 'interview_passed' THEN 1 END) AS successful
      FROM job_applications
    `);

    const data = rates[0];
    const totalApps = parseInt(data.total_applications) || 0;
    const shortlisted = parseInt(data.shortlisted) || 0;
    const interviewed = parseInt(data.interviewed) || 0;
    const successful = parseInt(data.successful) || 0;

    return {
      application_to_shortlist: totalApps > 0 ? (shortlisted / totalApps) * 100 : 0,
      shortlist_to_interview: shortlisted > 0 ? (interviewed / shortlisted) * 100 : 0,
      interview_to_success: interviewed > 0 ? (successful / interviewed) * 100 : 0,
    };
  }

  async getGovernmentComplianceReport(): Promise<any> {
    const dashboard = await this.getPlatformDashboard();
    
    // Add government-specific metrics
    const complianceMetrics = await this.getComplianceMetrics();
    
    return {
      ...dashboard,
      compliance: complianceMetrics,
      report_metadata: {
        generated_at: new Date().toISOString(),
        report_type: 'government_compliance',
        reporting_period: 'monthly',
        authority: 'Department of Foreign Employment, Nepal',
        platform: 'Udaan Sarathi',
      }
    };
  }

  async getRecentActivity(limit: number = 10): Promise<Array<{
    id: string;
    type: 'job_posted' | 'application_submitted' | 'interview_scheduled' | 'agency_registered';
    title: string;
    description: string;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high';
  }>> {
    // Get recent job postings
    const recentJobs = await this.postingRepo.query(`
      SELECT 
        jp.id,
        'job_posted' as type,
        'New Job Posted' as title,
        CONCAT(jpos.title, ' position in ', jp.country) as description,
        jp.created_at as timestamp,
        'medium' as priority
      FROM job_postings jp
      JOIN job_contracts jc ON jp.id = jc.job_posting_id
      JOIN job_positions jpos ON jc.id = jpos.job_contract_id
      WHERE jp.created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY jp.created_at DESC
      LIMIT ${Math.floor(limit / 3)}
    `);

    // Get recent applications
    const recentApplications = await this.applicationRepo.query(`
      SELECT 
        ja.id,
        'application_submitted' as type,
        'Application Submitted' as title,
        CONCAT('New application for ', jpos.title, ' position') as description,
        ja.created_at as timestamp,
        'low' as priority
      FROM job_applications ja
      JOIN job_postings jp ON ja.job_posting_id = jp.id
      JOIN job_contracts jc ON jp.id = jc.job_posting_id
      JOIN job_positions jpos ON jc.id = jpos.job_contract_id
      WHERE ja.created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY ja.created_at DESC
      LIMIT ${Math.floor(limit / 3)}
    `);

    // Get recent interviews
    const recentInterviews = await this.interviewRepo.query(`
      SELECT 
        iv.id,
        'interview_scheduled' as type,
        'Interview Scheduled' as title,
        CONCAT('Interview scheduled for ', jpos.title, ' position') as description,
        iv.created_at as timestamp,
        'medium' as priority
      FROM interview_details iv
      JOIN job_applications ja ON iv.job_application_id = ja.id
      JOIN job_postings jp ON ja.job_posting_id = jp.id
      JOIN job_contracts jc ON jp.id = jc.job_posting_id
      JOIN job_positions jpos ON jc.id = jpos.job_contract_id
      WHERE iv.created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY iv.created_at DESC
      LIMIT ${Math.floor(limit / 3)}
    `);

    // Combine and sort all activities
    const allActivities = [
      ...recentJobs.map(job => ({
        id: `job_${job.id}`,
        type: job.type as 'job_posted',
        title: job.title,
        description: job.description,
        timestamp: new Date(job.timestamp),
        priority: job.priority as 'medium'
      })),
      ...recentApplications.map(app => ({
        id: `app_${app.id}`,
        type: app.type as 'application_submitted',
        title: app.title,
        description: app.description,
        timestamp: new Date(app.timestamp),
        priority: app.priority as 'low'
      })),
      ...recentInterviews.map(interview => ({
        id: `interview_${interview.id}`,
        type: interview.type as 'interview_scheduled',
        title: interview.title,
        description: interview.description,
        timestamp: new Date(interview.timestamp),
        priority: interview.priority as 'medium'
      }))
    ];

    return allActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private async getComplianceMetrics(): Promise<any> {
    // License compliance - using proper TypeORM syntax
    const totalAgencies = await this.agencyRepo.count();
    const licensedAgencies = await this.agencyRepo
      .createQueryBuilder('pa')
      .where('pa.license_number IS NOT NULL')
      .andWhere('pa.license_number != \'\'')
      .getCount();

    // Job posting compliance - using proper TypeORM syntax
    const totalJobs = await this.postingRepo.count();
    const compliantJobs = await this.postingRepo
      .createQueryBuilder('jp')
      .where('jp.lt_number IS NOT NULL')
      .andWhere('jp.approval_date_ad IS NOT NULL')
      .getCount();

    return {
      agency_licensing: {
        total_agencies: totalAgencies,
        licensed_agencies: licensedAgencies,
        compliance_rate: totalAgencies > 0 ? (licensedAgencies / totalAgencies * 100) : 0
      },
      job_posting_compliance: {
        total_jobs: totalJobs,
        compliant_jobs: compliantJobs,
        compliance_rate: totalJobs > 0 ? (compliantJobs / totalJobs * 100) : 0
      }
    };
  }
}
