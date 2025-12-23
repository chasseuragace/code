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

export interface StateChange {
  [field: string]: [any, any]; // [oldValue, newValue]
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

  /**
   * Track state changes between old and new values
   */
  private trackStateChange(oldValue: any, newValue: any, fieldName: string): StateChange {
    const changes: StateChange = {};
    if (oldValue !== newValue) {
      changes[fieldName] = [oldValue, newValue];
    }
    return changes;
  }

  /**
   * Merge state changes from multiple fields
   */
  private mergeStateChanges(...changes: StateChange[]): StateChange {
    return changes.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }

  async updateBasicInfo(agencyId: string, payload: { name?: string; description?: string; established_year?: number; license_number?: string; }): Promise<{ updated: PostingAgency; stateChange: StateChange }> {
    const current = await this.getAgencyOrThrow(agencyId);
    
    const stateChange: StateChange = {};
    
    if (payload.name !== undefined && payload.name !== current.name) {
      stateChange.name = [current.name, payload.name];
    }
    if (payload.description !== undefined && payload.description !== current.description) {
      stateChange.description = [current.description, payload.description];
    }
    if (payload.established_year !== undefined && payload.established_year !== (current as any).established_year) {
      stateChange.established_year = [(current as any).established_year, payload.established_year];
    }
    if (payload.license_number !== undefined) {
      const normalized = normalizeLicenseNumber(payload.license_number);
      if (normalized !== current.license_number) {
        stateChange.license_number = [current.license_number, normalized];
      }
    }

    const dto: UpdateAgencyDto = {
      name: payload.name,
      description: payload.description,
      established_year: payload.established_year,
      license_number: payload.license_number ? normalizeLicenseNumber(payload.license_number) : payload.license_number,
    } as any;

    await this.agencyRepository.update(agencyId, {
      ...dto,
      updated_at: new Date(),
    } as any);

    const updated = await this.getAgencyOrThrow(agencyId);
    return { updated, stateChange };
  }

  async updateContact(agencyId: string, payload: { phones?: string[]; emails?: string[]; website?: string; contact_persons?: any[]; }): Promise<{ updated: PostingAgency; stateChange: StateChange }> {
    const current = await this.getAgencyOrThrow(agencyId);
    const stateChange: StateChange = {};

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date(),
    };

    // Replace phones array if provided
    if (payload.phones !== undefined) {
      if (JSON.stringify(payload.phones) !== JSON.stringify(current.phones)) {
        stateChange.phones = [current.phones, payload.phones];
      }
      updateData.phones = payload.phones;
    }

    // Replace emails array if provided
    if (payload.emails !== undefined) {
      if (JSON.stringify(payload.emails) !== JSON.stringify(current.emails)) {
        stateChange.emails = [current.emails, payload.emails];
      }
      updateData.emails = payload.emails;
    }

    // Update website if provided
    if (payload.website !== undefined && payload.website !== current.website) {
      stateChange.website = [current.website, payload.website];
      updateData.website = payload.website;
    }

    // Update contact_persons if provided
    if (payload.contact_persons !== undefined) {
      if (JSON.stringify(payload.contact_persons) !== JSON.stringify((current as any).contact_persons)) {
        stateChange.contact_persons = [(current as any).contact_persons, payload.contact_persons];
      }
      updateData.contact_persons = payload.contact_persons;
    }

    await this.agencyRepository.update(agencyId, updateData);
    const updated = await this.getAgencyOrThrow(agencyId);
    return { updated, stateChange };
  }

  async updateLocation(agencyId: string, payload: { address?: string; latitude?: number; longitude?: number; }): Promise<{ updated: PostingAgency; stateChange: StateChange }> {
    const current = await this.getAgencyOrThrow(agencyId);
    const stateChange: StateChange = {};

    if (payload.address !== undefined && payload.address !== current.address) {
      stateChange.address = [current.address, payload.address];
    }
    if (payload.latitude !== undefined && payload.latitude !== (current as any).latitude) {
      stateChange.latitude = [(current as any).latitude, payload.latitude];
    }
    if (payload.longitude !== undefined && payload.longitude !== (current as any).longitude) {
      stateChange.longitude = [(current as any).longitude, payload.longitude];
    }

    const dto: any = {
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
    };

    await this.agencyRepository.update(agencyId, {
      ...dto,
      updated_at: new Date(),
    } as any);

    const updated = await this.getAgencyOrThrow(agencyId);
    return { updated, stateChange };
  }

  async updateSocialMedia(agencyId: string, social_media: any): Promise<{ updated: PostingAgency; stateChange: StateChange }> {
    const current = await this.getAgencyOrThrow(agencyId);
    const stateChange: StateChange = {};

    if (JSON.stringify(social_media) !== JSON.stringify((current as any).social_media)) {
      stateChange.social_media = [(current as any).social_media, social_media];
    }

    // Replace the entire social_media object (don't merge with existing)
    await this.agencyRepository.update(agencyId, {
      social_media,
      updated_at: new Date(),
    } as any);

    const updated = await this.getAgencyOrThrow(agencyId);
    return { updated, stateChange };
  }

  async updateServices(agencyId: string, payload: { services?: string[]; specializations?: string[]; target_countries?: string[]; }): Promise<{ updated: PostingAgency; stateChange: StateChange }> {
    const current = await this.getAgencyOrThrow(agencyId);
    const stateChange: StateChange = {};

    if (payload.services !== undefined) {
      if (JSON.stringify(payload.services) !== JSON.stringify((current as any).services)) {
        stateChange.services = [(current as any).services, payload.services];
      }
    }
    if (payload.specializations !== undefined) {
      if (JSON.stringify(payload.specializations) !== JSON.stringify((current as any).specializations)) {
        stateChange.specializations = [(current as any).specializations, payload.specializations];
      }
    }
    if (payload.target_countries !== undefined) {
      if (JSON.stringify(payload.target_countries) !== JSON.stringify((current as any).target_countries)) {
        stateChange.target_countries = [(current as any).target_countries, payload.target_countries];
      }
    }

    const dto: UpdateAgencyDto = {
      services: payload.services,
      specializations: payload.specializations,
      target_countries: payload.target_countries,
    } as any;

    await this.agencyRepository.update(agencyId, {
      ...dto,
      updated_at: new Date(),
    } as any);

    const updated = await this.getAgencyOrThrow(agencyId);
    return { updated, stateChange };
  }

  async updateSettings(agencyId: string, settings: any): Promise<{ updated: PostingAgency; stateChange: StateChange }> {
    const current = await this.getAgencyOrThrow(agencyId);
    const stateChange: StateChange = {};

    if (JSON.stringify(settings) !== JSON.stringify((current as any).settings)) {
      stateChange.settings = [(current as any).settings, settings];
    }

    // Replace the entire settings object (don't merge with existing)
    await this.agencyRepository.update(agencyId, {
      settings,
      updated_at: new Date(),
    } as any);

    const updated = await this.getAgencyOrThrow(agencyId);
    return { updated, stateChange };
  }
}
