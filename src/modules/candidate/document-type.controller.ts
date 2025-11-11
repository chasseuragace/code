import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DocumentTypeService } from './document-type.service';
import { DocumentTypeResponseDto } from './dto/document-type.dto';

@ApiTags('document-types')
@Controller('document-types')
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Get()
  @ApiOperation({ summary: 'List all document types' })
  @ApiOkResponse({ 
    description: 'List of available document types',
    type: [DocumentTypeResponseDto]
  })
  async listDocumentTypes(): Promise<DocumentTypeResponseDto[]> {
    const types = await this.documentTypeService.findAll();
    return types.map(type => ({
      id: type.id,
      name: type.name,
      type_code: type.type_code,
      description: type.description,
      is_required: type.is_required,
      display_order: type.display_order,
      allowed_mime_types: type.allowed_mime_types,
      max_file_size_mb: type.max_file_size_mb,
    }));
  }
}
