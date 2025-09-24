import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting, InterviewDetail, JobPosition } from 'src/modules/domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';

export interface PortalOverview {
  generated_at: string;
  totals: {
    agencies: number;
    postings: { total: number; active: number; inactive: number };
    interviews: number;
    countries: number;
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
  ) {}

  async getPortalOverview(topCountriesLimit = 5): Promise<PortalOverview> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [agencies, totalPostings, activePostings, interviewsTotal, countriesRow] = await Promise.all([
      this.agencyRepo.count(),
      this.postingRepo.count(),
      this.postingRepo.count({ where: { is_active: true } }),
      this.interviewRepo.count(),
      this.postingRepo
        .createQueryBuilder('jp')
        .select('COUNT(DISTINCT jp.country)', 'cnt')
        .getRawOne<{ cnt: string }>(),
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
        countries: Number(countriesRow?.cnt || 0),
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
}
