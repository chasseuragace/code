import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DraftJobService } from './draft-job.service';
import { CreateDraftJobDto } from './dto/create-draft-job.dto';
import { UpdateDraftJobDto } from './dto/update-draft-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgencyService } from '../agency/agency.service';

@Controller('agencies/:license/draft-jobs')
@UseGuards(JwtAuthGuard)
export class DraftJobController {
  constructor(
    private readonly draftJobService: DraftJobService,
    private readonly agencyService: AgencyService,
  ) {}

  @Post()
  async create(
    @Param('license') license: string,
    @Request() req: any,
    @Body() createDto: CreateDraftJobDto,
  ) {
    const userId = req.user.id;
    
    // Get agency ID from license number
    const agency = await this.agencyService.findAgencyByLicense(license);
    const agencyId = agency.id;

    return await this.draftJobService.create(agencyId, userId, createDto);
  }

  @Get()
  async findAll(@Param('license') license: string, @Request() req: any) {
    const userId = req.user.id;
    
    // Get agency ID from license number
    const agency = await this.agencyService.findAgencyByLicense(license);
    const agencyId = agency.id;

    return await this.draftJobService.findAll(agencyId, userId);
  }

  @Get(':id')
  async findOne(
    @Param('license') license: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const agency = await this.agencyService.findAgencyByLicense(license);
    const agencyId = agency.id;

    return await this.draftJobService.findOne(id, agencyId, userId);
  }

  @Patch(':id')
  async update(
    @Param('license') license: string,
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateDto: UpdateDraftJobDto,
  ) {
    const userId = req.user.id;
    const agency = await this.agencyService.findAgencyByLicense(license);
    const agencyId = agency.id;

    return await this.draftJobService.update(id, agencyId, userId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('license') license: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const agency = await this.agencyService.findAgencyByLicense(license);
    const agencyId = agency.id;

    await this.draftJobService.remove(id, agencyId, userId);
  }

  @Post(':id/publish')
  async publish(
    @Param('license') license: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const agency = await this.agencyService.findAgencyByLicense(license);
    const agencyId = agency.id;

    return await this.draftJobService.publishDraft(id, agencyId, userId, license);
  }

  @Post(':id/validate')
  async validate(
    @Param('license') license: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    const agencyId = req.user.agencyId;

    const draft = await this.draftJobService.findOne(id, agencyId, userId);
    const validation = this.draftJobService.validateDraftForPublishing(draft);

    return {
      draft_id: draft.id,
      ...validation,
    };
  }
}
