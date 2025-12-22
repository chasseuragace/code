import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostingAgency } from '../domain/PostingAgency';
import { UpdateAgencyDto } from './dto/agency.dto';

/**
 * Normalize license number by replacing URL-breaking characters
 * Converts slashes (/) to dashes (-) to prevent routing issues
 */
function normalizeLicenseNumber(licenseNumber: string): string {
  if (!licenseNumber) return licenseNumber;
  return licenseNumber.replace(/\//g, '-');
}

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
      // Normalize license number to prevent URL routing issues
      license_number: payload.license_number ? normalizeLicenseNumber(payload.license_number) : payload.license_number,
    } as any;

    await this.agencyRepository.update(agencyId, {
      ...dto,
      updated_at: new Date(),
    } as any);

    return this.getAgencyOrThrow(agencyId);
  }

  async updateContact(agencyId: string, payload: { phones?: string[]; emails?: string[]; website?: string; contact_persons?: any[]; }): Promise<PostingAgency> {
    const current = await this.getAgencyOrThrow(agencyId);

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date(),
    };

    // Replace phones array if provided
    if (payload.phones !== undefined) {
      updateData.phones = payload.phones;
    }

    // Replace emails array if provided
    if (payload.emails !== undefined) {
      updateData.emails = payload.emails;
    }

    // Update website if provided
    if (payload.website !== undefined) {
      updateData.website = payload.website;
    }

    // Update contact_persons if provided
    if (payload.contact_persons !== undefined) {
      updateData.contact_persons = payload.contact_persons;
    }

    await this.agencyRepository.update(agencyId, updateData);

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
    // Replace the entire social_media object (don't merge with existing)
    await this.agencyRepository.update(agencyId, {
      social_media,
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
    // Replace the entire settings object (don't merge with existing)
    await this.agencyRepository.update(agencyId, {
      settings,
      updated_at: new Date(),
    } as any);

    return this.getAgencyOrThrow(agencyId);
  }
}
