import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InterviewService } from './domain.service';
import { ListInterviewsQueryDto, PaginatedInterviewsDto, InterviewEnrichedDto } from './dto/interview-list.dto';

@ApiTags('interviews')
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviews: InterviewService) {}

  @Get()
  @ApiOperation({ summary: 'List interviews by candidate IDs, upcoming-first by default' })
  @ApiQuery({ name: 'candidate_ids', required: true, isArray: true, type: String, description: 'One or more candidate UUIDs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'only_upcoming', required: false, type: Boolean })
  @ApiQuery({ name: 'order', required: false, enum: ['upcoming', 'recent'] })
  async list(@Query() q: any): Promise<PaginatedInterviewsDto> {
    const candidateIds: string[] = Array.isArray(q.candidate_ids)
      ? q.candidate_ids
      : typeof q.candidate_ids === 'string'
        ? q.candidate_ids.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

    const page = q.page ? parseInt(q.page as any, 10) : undefined;
    const limit = q.limit ? parseInt(q.limit as any, 10) : undefined;
    const onlyUpcoming = q.only_upcoming != null ? String(q.only_upcoming).toLowerCase() === 'true' : undefined;
    const order = q.order === 'recent' ? 'recent' : 'upcoming';

    const res = await this.interviews.listByCandidates({ candidateIds, page, limit, only_upcoming: onlyUpcoming, order });

    const items: InterviewEnrichedDto[] = res.items.map((it) => ({
      id: (it as any).id,
      schedule: {
        date_ad: it.interview_date_ad ? new Date(it.interview_date_ad as any).toISOString().slice(0, 10) : null,
        date_bs: it.interview_date_bs ?? null,
        time: it.interview_time ?? null,
      },
      location: it.location ?? null,
      contact_person: it.contact_person ?? null,
      required_documents: it.required_documents ?? null,
      notes: it.notes ?? null,
      application: it.job_application_id ? { id: (it as any)._app_id, status: (it as any)._app_status } : null,
      posting: {
        id: (it as any).job_posting?.id,
        posting_title: (it as any).job_posting?.posting_title,
        country: (it as any).job_posting?.country,
        city: (it as any).job_posting?.city ?? null,
      },
      agency: (it as any)._agency,
      employer: (it as any)._employer,
      expenses: (it as any).expenses?.map((e: any) => ({
        expense_type: e.expense_type,
        who_pays: e.who_pays,
        is_free: !!e.is_free,
        amount: e.amount != null ? Number(e.amount) : undefined,
        currency: e.currency ?? undefined,
        refundable: !!e.refundable,
        notes: e.notes ?? undefined,
      })) ?? [],
    }));

    return { page: res.page, limit: res.limit, total: res.total, items };
  }
}
