import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostingAgency } from '../domain/PostingAgency';
import { UpdateAgencyDto } from './dto/agency.dto';

@Injectable()
export class AgencyProfileService {
  constructor(
    @InjectRepository(PostingAgency)
    private readonly agencyRepository: Repository<PostingAgency>,
  ) {}

  private async getAgencyOrThrow(id: string): Promise<PostingAgency> {
    const agency = await this.agencyRepository.findOne({ where: { id } });
    if (!agency) {
      throw new NotFoundException(`Agency with ID ${id} not found`);
    }
    return agency;
  }

  async updateBasicInfo(agencyId: string, payload: { name?: string; description?: string; established_year?: number; license_number?: string; }): Promise<PostingAgency> {
    const dto: UpdateAgencyDto = {
      name: payload.name,
      description: payload.description,
      established_year: payload.established_year,
      // license_number is technically mutable but usually stable
      license_number: payload.license_number,
    } as any;

    await this.agencyRepository.update(agencyId, {
      ...dto,
      updated_at: new Date(),
    } as any);

    return this.getAgencyOrThrow(agencyId);
  }

  async updateContact(agencyId: string, payload: { phone?: string; mobile?: string; email?: string; website?: string; contact_persons?: any[]; }): Promise<PostingAgency> {
    const current = await this.getAgencyOrThrow(agencyId);

    // Replace phones array with new values (don't append to existing)
    const phones = Array.from(new Set([
      ...(payload.phone ? [payload.phone] : []),
      ...(payload.mobile ? [payload.mobile] : []),
    ].filter(Boolean))) as string[] | undefined;

    // Replace emails array with new value (don't append to existing)
    const emails = Array.from(new Set([
      ...(payload.email ? [payload.email] : []),
    ].filter(Boolean))) as string[] | undefined;

    const dto: UpdateAgencyDto = {
      phones,
      emails,
      website: payload.website ?? current.website,
      contact_persons: payload.contact_persons ?? current.contact_persons,
    } as any;

    await this.agencyRepository.update(agencyId, {
      ...dto,
      updated_at: new Date(),
    } as any);

    return this.getAgencyOrThrow(agencyId);
  }

  async updateLocation(agencyId: string, payload: { address?: string; latitude?: number; longitude?: number; }): Promise<PostingAgency> {
    const dto: any = {
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
    };

    await this.agencyRepository.update(agencyId, {
      ...dto,
      updated_at: new Date(),
    } as any);

    return this.getAgencyOrThrow(agencyId);
  }

  async updateSocialMedia(agencyId: string, social_media: any): Promise<PostingAgency> {
    const dto: UpdateAgencyDto = {
      social_media,
    } as any;

    await this.agencyRepository.update(agencyId, {
      ...dto,
      updated_at: new Date(),
    } as any);

    return this.getAgencyOrThrow(agencyId);
  }

  async updateServices(agencyId: string, payload: { services?: string[]; specializations?: string[]; target_countries?: string[]; }): Promise<PostingAgency> {
    const dto: UpdateAgencyDto = {
      services: payload.services,
      specializations: payload.specializations,
      target_countries: payload.target_countries,
    } as any;

    await this.agencyRepository.update(agencyId, {
      ...dto,
      updated_at: new Date(),
    } as any);

    return this.getAgencyOrThrow(agencyId);
  }

  async updateSettings(agencyId: string, settings: any): Promise<PostingAgency> {
    const dto: UpdateAgencyDto = {
      settings,
    } as any;

    await this.agencyRepository.update(agencyId, {
      ...dto,
      updated_at: new Date(),
    } as any);

    return this.getAgencyOrThrow(agencyId);
  }
}
