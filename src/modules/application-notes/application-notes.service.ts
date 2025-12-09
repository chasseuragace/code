import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationNote } from './application-note.entity';
import { JobApplication } from '../application/job-application.entity';
import { JobPosting } from '../domain/domain.entity';
import {
  CreateApplicationNoteDto,
  UpdateApplicationNoteDto,
  ApplicationNoteResponseDto,
} from './dto/application-note.dto';

@Injectable()
export class ApplicationNotesService {
  constructor(
    @InjectRepository(ApplicationNote)
    private readonly noteRepo: Repository<ApplicationNote>,
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>,
  ) {}

  /**
   * Create a new application note
   */
  async createNote(
    agencyId: string,
    userId: string,
    userName: string,
    createDto: CreateApplicationNoteDto,
  ): Promise<ApplicationNoteResponseDto> {
    // Verify agency has access to this application
    await this.verifyAgencyAccess(agencyId, createDto.job_application_id);

    const note = this.noteRepo.create({
      job_application_id: createDto.job_application_id,
      agency_id: agencyId,
      added_by_user_id: userId,
      added_by_name: userName,
      note_text: createDto.note_text,
      is_private: createDto.is_private ?? true,
    });

    const savedNote = await this.noteRepo.save(note);
    return this.toResponseDto(savedNote);
  }

  /**
   * Get all notes for an application
   */
  async getNotesByApplication(
    agencyId: string,
    applicationId: string,
  ): Promise<ApplicationNoteResponseDto[]> {
    // Verify agency has access to this application
    await this.verifyAgencyAccess(agencyId, applicationId);

    const notes = await this.noteRepo.find({
      where: {
        job_application_id: applicationId,
        agency_id: agencyId,
      },
      order: {
        created_at: 'DESC',
      },
    });

    return notes.map((note) => this.toResponseDto(note));
  }

  /**
   * Update a note
   */
  async updateNote(
    agencyId: string,
    noteId: string,
    updateDto: UpdateApplicationNoteDto,
  ): Promise<ApplicationNoteResponseDto> {
    const note = await this.noteRepo.findOne({
      where: {
        id: noteId,
        agency_id: agencyId,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found or access denied');
    }

    if (updateDto.note_text !== undefined) {
      note.note_text = updateDto.note_text;
    }

    if (updateDto.is_private !== undefined) {
      note.is_private = updateDto.is_private;
    }

    const updatedNote = await this.noteRepo.save(note);
    return this.toResponseDto(updatedNote);
  }

  /**
   * Delete a note
   */
  async deleteNote(agencyId: string, noteId: string): Promise<void> {
    const note = await this.noteRepo.findOne({
      where: {
        id: noteId,
        agency_id: agencyId,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found or access denied');
    }

    await this.noteRepo.remove(note);
  }

  /**
   * Verify agency has access to the application
   */
  private async verifyAgencyAccess(
    agencyId: string,
    applicationId: string,
  ): Promise<void> {
    const application = await this.applicationRepo
      .createQueryBuilder('app')
      .leftJoin('app.job_posting', 'jobPosting')
      .leftJoin('jobPosting.contracts', 'contract')
      .where('app.id = :applicationId', { applicationId })
      .andWhere('contract.posting_agency_id = :agencyId', { agencyId })
      .getOne();

    if (!application) {
      throw new ForbiddenException('Access denied to this application');
    }
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(note: ApplicationNote): ApplicationNoteResponseDto {
    return {
      id: note.id,
      job_application_id: note.job_application_id,
      agency_id: note.agency_id,
      added_by_user_id: note.added_by_user_id,
      added_by_name: note.added_by_name,
      note_text: note.note_text,
      is_private: note.is_private,
      created_at: note.created_at,
      updated_at: note.updated_at,
    };
  }
}
