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
} from '@nestjs/common';
import { ApplicationNotesService } from './application-notes.service';
import {
  CreateApplicationNoteDto,
  UpdateApplicationNoteDto,
  ApplicationNoteResponseDto,
} from './dto/application-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('application-notes')
@UseGuards(JwtAuthGuard)
export class ApplicationNotesController {
  constructor(private readonly notesService: ApplicationNotesService) {}

  /**
   * Create a new note
   * POST /application-notes
   */
  @Post()
  async createNote(
    @Request() req,
    @Body() createDto: CreateApplicationNoteDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: ApplicationNoteResponseDto;
  }> {
    const agencyId = req.user.agency_id;
    const userId = req.user.id;
    const userName = req.user.full_name || 'Unknown User';

    const note = await this.notesService.createNote(
      agencyId,
      userId,
      userName,
      createDto,
    );

    return {
      success: true,
      message: 'Note created successfully',
      data: note,
    };
  }

  /**
   * Get all notes for an application
   * GET /application-notes/application/:applicationId
   */
  @Get('application/:applicationId')
  async getNotesByApplication(
    @Request() req,
    @Param('applicationId') applicationId: string,
  ): Promise<{
    success: boolean;
    data: ApplicationNoteResponseDto[];
  }> {
    const agencyId = req.user.agency_id;

    const notes = await this.notesService.getNotesByApplication(
      agencyId,
      applicationId,
    );

    return {
      success: true,
      data: notes,
    };
  }

  /**
   * Update a note
   * PATCH /application-notes/:noteId
   */
  @Patch(':noteId')
  async updateNote(
    @Request() req,
    @Param('noteId') noteId: string,
    @Body() updateDto: UpdateApplicationNoteDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: ApplicationNoteResponseDto;
  }> {
    const agencyId = req.user.agency_id;

    const note = await this.notesService.updateNote(agencyId, noteId, updateDto);

    return {
      success: true,
      message: 'Note updated successfully',
      data: note,
    };
  }

  /**
   * Delete a note
   * DELETE /application-notes/:noteId
   */
  @Delete(':noteId')
  async deleteNote(
    @Request() req,
    @Param('noteId') noteId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const agencyId = req.user.agency_id;

    await this.notesService.deleteNote(agencyId, noteId);

    return {
      success: true,
      message: 'Note deleted successfully',
    };
  }
}
