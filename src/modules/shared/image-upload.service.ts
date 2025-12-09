import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Express } from 'express';

export interface UploadResult {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export enum UploadType {
  AGENCY_LOGO = 'agency_logo',
  AGENCY_BANNER = 'agency_banner',
  JOB_CUTOUT = 'job_cutout',
  CANDIDATE_PROFILE = 'candidate_profile',
  CANDIDATE_DOCUMENT = 'candidate_document',
  CANDIDATE_MEDIA = 'candidate_media'
}

@Injectable()
export class ImageUploadService {
  private readonly uploadDir = path.join(process.cwd(), 'public', 'uploads');
  private readonly maxImageSize = 5 * 1024 * 1024; // 5MB
  private readonly maxDocumentSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private readonly allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  constructor() {
    this.ensureUploadDirectories();
  }

  private ensureUploadDirectories(): void {
    const directories = [
      path.join(this.uploadDir, 'agencies'),
      path.join(this.uploadDir, 'candidates'),
      path.join(this.uploadDir, 'jobs')
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private getUploadPath(type: UploadType, entityId: string): string {
    switch (type) {
      case UploadType.AGENCY_LOGO:
      case UploadType.AGENCY_BANNER:
        return path.join(this.uploadDir, 'agencies', entityId);
      case UploadType.CANDIDATE_PROFILE:
      case UploadType.CANDIDATE_DOCUMENT:
        return path.join(this.uploadDir, 'candidates', entityId);
      case UploadType.CANDIDATE_MEDIA:
        return path.join(this.uploadDir, 'candidates', entityId, 'mediamanager');
      case UploadType.JOB_CUTOUT:
        return path.join(this.uploadDir, 'jobs', entityId);
      default:
        throw new BadRequestException('Invalid upload type');
    }
  }

  private getFileName(type: UploadType, originalName: string, documentId?: string): string {
    const extension = path.extname(originalName).toLowerCase();
    
    switch (type) {
      case UploadType.AGENCY_LOGO:
        return `logo${extension}`;
      case UploadType.AGENCY_BANNER:
        return `banner${extension}`;
      case UploadType.JOB_CUTOUT:
        return `cutout${extension}`;
      case UploadType.CANDIDATE_PROFILE:
        return `profile${extension}`;
      case UploadType.CANDIDATE_DOCUMENT:
        return documentId ? `${documentId}${extension}` : `${uuidv4()}${extension}`;
      case UploadType.CANDIDATE_MEDIA:
        // Generate unique filename with timestamp for media manager
        const timestamp = Date.now();
        return `${timestamp}_${uuidv4()}${extension}`;
      default:
        throw new BadRequestException('Invalid upload type');
    }
  }

  private validateFile(file: Express.Multer.File, type: UploadType): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const isDocument = type === UploadType.CANDIDATE_DOCUMENT;
    const isMedia = type === UploadType.CANDIDATE_MEDIA;
    const maxSize = (isDocument || isMedia) ? this.maxDocumentSize : this.maxImageSize;
    
    // Documents and media accept both images and document types
    const allowedTypes = (isMedia || isDocument)
      ? [...this.allowedImageTypes, ...this.allowedDocumentTypes]
      : this.allowedImageTypes;

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      throw new BadRequestException(`File size exceeds ${maxSizeMB}MB limit`);
    }

    if (!allowedTypes.includes(file.mimetype)) {
      const typeCategory = isMedia ? 'file' : (isDocument ? 'document' : 'image');
      throw new BadRequestException(`Invalid ${typeCategory} type. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  private generateUrl(type: UploadType, entityId: string, fileName: string): string {
    const basePath = 'public/uploads';
    switch (type) {
      case UploadType.AGENCY_LOGO:
      case UploadType.AGENCY_BANNER:
        return `${basePath}/agencies/${entityId}/${fileName}`;
      case UploadType.CANDIDATE_PROFILE:
      case UploadType.CANDIDATE_DOCUMENT:
        return `${basePath}/candidates/${entityId}/${fileName}`;
      case UploadType.CANDIDATE_MEDIA:
        return `${basePath}/candidates/${entityId}/mediamanager/${fileName}`;
      case UploadType.JOB_CUTOUT:
        return `${basePath}/jobs/${entityId}/${fileName}`;
      default:
        throw new BadRequestException('Invalid upload type');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    type: UploadType,
    entityId: string,
    documentId?: string
  ): Promise<UploadResult> {
    try {
      this.validateFile(file, type);

      const uploadPath = this.getUploadPath(type, entityId);
      const fileName = this.getFileName(type, file.originalname, documentId);
      const fullPath = path.join(uploadPath, fileName);

      // Ensure directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Remove existing file if it exists (for profile images and logos)
      if (fs.existsSync(fullPath) && type !== UploadType.CANDIDATE_DOCUMENT) {
        fs.unlinkSync(fullPath);
      }

      // Write the file
      fs.writeFileSync(fullPath, file.buffer);

      const url = this.generateUrl(type, entityId, fileName);

      return {
        success: true,
        url,
        fileName,
        fileSize: file.size,
        fileType: file.mimetype,
        message: 'File uploaded successfully'
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteFile(type: UploadType, entityId: string, fileName?: string): Promise<UploadResult> {
    try {
      const uploadPath = this.getUploadPath(type, entityId);
      
      if (fileName) {
        // Delete specific file
        const fullPath = path.join(uploadPath, fileName);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          return {
            success: true,
            message: 'File deleted successfully'
          };
        } else {
          return {
            success: false,
            error: 'File not found'
          };
        }
      } else {
        // Delete all files in the directory (for profile images, logos, etc.)
        if (fs.existsSync(uploadPath)) {
          const files = fs.readdirSync(uploadPath);
          files.forEach(file => {
            fs.unlinkSync(path.join(uploadPath, file));
          });
          return {
            success: true,
            message: 'Files deleted successfully'
          };
        } else {
          return {
            success: false,
            error: 'Directory not found'
          };
        }
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  sanitizeFileName(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  async listMediaFiles(candidateId: string): Promise<{ files: Array<{ fileName: string; url: string; size: number; createdAt: Date }> }> {
    try {
      const mediaPath = path.join(this.uploadDir, 'candidates', candidateId, 'mediamanager');
      
      if (!fs.existsSync(mediaPath)) {
        return { files: [] };
      }

      const files = fs.readdirSync(mediaPath);
      const fileDetails = files
        .filter(file => !file.startsWith('.')) // Ignore hidden files
        .map(file => {
          const filePath = path.join(mediaPath, file);
          const stats = fs.statSync(filePath);
          return {
            fileName: file,
            url: `public/uploads/candidates/${candidateId}/mediamanager/${file}`,
            size: stats.size,
            createdAt: stats.birthtime
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first

      return { files: fileDetails };
    } catch (error) {
      throw new InternalServerErrorException('Failed to list media files');
    }
  }
}
