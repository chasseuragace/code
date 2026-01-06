import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from './document-type.entity';

export interface DocumentTypeSeedDto {
  name: string;
  type_code: string;
  description?: string;
  is_required?: boolean;
  display_order?: number;
  allowed_mime_types?: string[];
  max_file_size_mb?: number;
}

@Injectable()
export class DocumentTypeService {
  constructor(
    @InjectRepository(DocumentType)
    private readonly repo: Repository<DocumentType>,
  ) {}

  async upsertMany(rows: DocumentTypeSeedDto[]): Promise<{ affected: number }> {
    if (!rows?.length) return { affected: 0 };
    
    for (const row of rows) {
      await this.repo.upsert(
        {
          name: row.name,
          type_code: row.type_code,
          description: row.description,
          is_required: row.is_required ?? false,
          display_order: row.display_order ?? 0,
          allowed_mime_types: row.allowed_mime_types,
          max_file_size_mb: row.max_file_size_mb,
          is_active: true,
        },
        ['type_code'], // Conflict target
      );
    }
    
    return { affected: rows.length };
  }

  async findAll(): Promise<DocumentType[]> {
    return this.repo.find({
      where: { is_active: true },
      order: { display_order: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<DocumentType | null> {
    return this.repo.findOne({ where: { id, is_active: true } });
  }

  async findByTypeCode(typeCode: string): Promise<DocumentType | null> {
    return this.repo.findOne({ where: { type_code: typeCode, is_active: true } });
  }

  async count(): Promise<number> {
    return this.repo.count({ where: { is_active: true } });
  }
}
