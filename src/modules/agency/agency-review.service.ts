import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AgencyReview } from './agency-review.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { CreateReviewDto } from './dto/review/create-review.dto';
import { UpdateReviewDto } from './dto/review/update-review.dto';
import { ReviewResponseDto } from './dto/review/review-response.dto';
import { PaginatedReviewsResponseDto } from './dto/review/paginated-reviews-response.dto';

@Injectable()
export class AgencyReviewService {
  constructor(
    @InjectRepository(AgencyReview) private reviewRepository: Repository<AgencyReview>,
    @InjectRepository(PostingAgency) private agencyRepository: Repository<PostingAgency>,
    private dataSource: DataSource,
  ) {}

  async createReview(
    candidateId: string,
    agencyId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      // Check if agency exists
      const agency = await manager.findOne(PostingAgency, { where: { id: agencyId } });
      if (!agency) {
        throw new NotFoundException(`Agency with ID ${agencyId} not found`);
      }

      // Check for existing review
      const existingReview = await manager.findOne(AgencyReview, {
        where: { candidate_id: candidateId, agency_id: agencyId },
      });

      if (existingReview) {
        throw new BadRequestException('You have already reviewed this agency');
      }

      // Validate rating
      if (dto.rating < 1 || dto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      // Create review
      const review = manager.create(AgencyReview, {
        candidate_id: candidateId,
        agency_id: agencyId,
        rating: dto.rating,
        review_text: dto.review_text,
      });

      const savedReview = await manager.save(review);

      // Update agency aggregates
      await this.updateAgencyRatingAggregates(manager, agencyId);

      return this.mapToResponseDto(savedReview);
    });
  }

  async updateReview(
    reviewId: string,
    candidateId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      // Find review
      const review = await manager.findOne(AgencyReview, { where: { id: reviewId } });

      if (!review) {
        throw new NotFoundException(`Review with ID ${reviewId} not found`);
      }

      // Check ownership
      if (review.candidate_id !== candidateId) {
        throw new ForbiddenException('You can only modify your own review');
      }

      // Update fields if provided
      if (dto.rating !== undefined) {
        if (dto.rating < 1 || dto.rating > 5) {
          throw new BadRequestException('Rating must be between 1 and 5');
        }
        review.rating = dto.rating;
      }

      if (dto.review_text !== undefined) {
        review.review_text = dto.review_text;
      }

      const updatedReview = await manager.save(review);

      // Update agency aggregates
      await this.updateAgencyRatingAggregates(manager, review.agency_id);

      return this.mapToResponseDto(updatedReview);
    });
  }

  async deleteReview(reviewId: string, candidateId: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      // Find review
      const review = await manager.findOne(AgencyReview, { where: { id: reviewId } });

      if (!review) {
        throw new NotFoundException(`Review with ID ${reviewId} not found`);
      }

      // Check ownership
      if (review.candidate_id !== candidateId) {
        throw new ForbiddenException('You can only delete your own review');
      }

      const agencyId = review.agency_id;

      // Delete review
      await manager.remove(review);

      // Update agency aggregates
      await this.updateAgencyRatingAggregates(manager, agencyId);
    });
  }

  async findReviewById(reviewId: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    return this.mapToResponseDto(review);
  }

  async listReviewsByAgency(
    agencyId: string,
    page: number = 1,
    limit: number = 10,
    candidateId?: string,
  ): Promise<PaginatedReviewsResponseDto> {
    // Validate pagination
    page = Math.max(1, page);
    limit = Math.min(100, Math.max(1, limit));

    const skip = (page - 1) * limit;

    // Build query
    const query = this.reviewRepository
      .createQueryBuilder('r')
      .where('r.agency_id = :agencyId', { agencyId })
      .orderBy('r.created_at', 'DESC');

    // Get total count
    const total = await query.getCount();

    // Get paginated results
    const reviews = await query.skip(skip).take(limit).getMany();

    // Map to response DTOs
    const data = reviews.map((review) => this.mapToResponseDto(review));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async updateAgencyRatingAggregates(manager: any, agencyId: string): Promise<void> {
    // Calculate average rating and count
    const result = await manager
      .createQueryBuilder(AgencyReview, 'r')
      .select('AVG(r.rating)', 'avg_rating')
      .addSelect('COUNT(*)', 'review_count')
      .where('r.agency_id = :agencyId', { agencyId })
      .getRawOne();

    const averageRating = result.avg_rating ? parseFloat(result.avg_rating) : 0;
    const reviewCount = parseInt(result.review_count || 0, 10);

    // Update agency
    await manager.update(
      PostingAgency,
      { id: agencyId },
      {
        average_rating: averageRating,
        review_count: reviewCount,
      },
    );
  }

  private mapToResponseDto(review: AgencyReview): ReviewResponseDto {
    return {
      id: review.id,
      agency_id: review.agency_id,
      candidate_id: review.candidate_id,
      rating: review.rating,
      review_text: review.review_text,
      created_at: review.created_at.toISOString(),
      updated_at: review.updated_at.toISOString(),
      candidate_name: review.candidate?.full_name,
    };
  }
}
