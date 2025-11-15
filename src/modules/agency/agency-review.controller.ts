import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Query,
  Body,
  HttpCode,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AgencyReviewService } from './agency-review.service';
import { AgencyService } from './agency.service';
import { CreateReviewDto } from './dto/review/create-review.dto';
import { UpdateReviewDto } from './dto/review/update-review.dto';
import { ReviewResponseDto } from './dto/review/review-response.dto';
import { PaginatedReviewsResponseDto } from './dto/review/paginated-reviews-response.dto';
import { DeleteReviewResponseDto } from './dto/review/delete-review-response.dto';

@ApiTags('Agency Reviews')
@Controller('agencies/:license/reviews')
export class AgencyReviewController {
  constructor(
    private readonly reviewService: AgencyReviewService,
    private readonly agencyService: AgencyService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a review for an agency',
    description: 'Allows a candidate to create a review for an agency. Only one review per candidate per agency is allowed.',
  })
  @ApiParam({
    name: 'license',
    description: 'Agency license number',
    example: 'LIC-AG-0001',
  })
  @ApiQuery({
    name: 'candidate_id',
    required: true,
    description: 'Candidate UUID',
    type: String,
  })
  @ApiBody({ type: CreateReviewDto })
  @ApiCreatedResponse({
    description: 'Review created successfully',
    type: ReviewResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or duplicate review',
  })
  @ApiNotFoundResponse({
    description: 'Agency not found',
  })
  async createReview(
    @Param('license') license: string,
    @Query('candidate_id', ParseUUIDPipe) candidateId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Get agency by license
    const agency = await this.agencyService.findAgencyByLicense(license);

    // Create review
    return this.reviewService.createReview(candidateId, agency.id, dto);
  }

  @Patch(':reviewId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update a review',
    description: 'Allows a candidate to update their own review. Only the review owner can update.',
  })
  @ApiParam({
    name: 'license',
    description: 'Agency license number',
    example: 'LIC-AG-0001',
  })
  @ApiParam({
    name: 'reviewId',
    description: 'Review UUID',
    example: 'd841e933-1a14-4602-97e2-c51c9e5d8cf2',
  })
  @ApiQuery({
    name: 'candidate_id',
    required: true,
    description: 'Candidate UUID',
    type: String,
  })
  @ApiBody({ type: UpdateReviewDto })
  @ApiOkResponse({
    description: 'Review updated successfully',
    type: ReviewResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
  })
  @ApiNotFoundResponse({
    description: 'Review not found',
  })
  @ApiForbiddenResponse({
    description: 'Cannot modify other candidate reviews',
  })
  async updateReview(
    @Param('license') license: string,
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Query('candidate_id', ParseUUIDPipe) candidateId: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Validate that at least one field is being updated
    if (dto.rating === undefined && dto.review_text === undefined) {
      throw new BadRequestException('At least one field (rating or review_text) must be provided for update');
    }

    return this.reviewService.updateReview(reviewId, candidateId, dto);
  }

  @Delete(':reviewId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete a review',
    description: 'Allows a candidate to delete their own review. Only the review owner can delete.',
  })
  @ApiParam({
    name: 'license',
    description: 'Agency license number',
    example: 'LIC-AG-0001',
  })
  @ApiParam({
    name: 'reviewId',
    description: 'Review UUID',
    example: 'd841e933-1a14-4602-97e2-c51c9e5d8cf2',
  })
  @ApiQuery({
    name: 'candidate_id',
    required: true,
    description: 'Candidate UUID',
    type: String,
  })
  @ApiOkResponse({
    description: 'Review deleted successfully',
    type: DeleteReviewResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Review not found',
  })
  @ApiForbiddenResponse({
    description: 'Cannot delete other candidate reviews',
  })
  async deleteReview(
    @Param('license') license: string,
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Query('candidate_id', ParseUUIDPipe) candidateId: string,
  ): Promise<DeleteReviewResponseDto> {
    await this.reviewService.deleteReview(reviewId, candidateId);

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List reviews for an agency',
    description: 'Retrieves all reviews for an agency with pagination. Optional candidate_id can be provided to identify the candidate own review in the list.',
  })
  @ApiParam({
    name: 'license',
    description: 'Agency license number',
    example: 'LIC-AG-0001',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page, max 100 (default: 10)',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'candidate_id',
    required: false,
    description: 'Optional candidate UUID to identify own review in the list',
    type: String,
  })
  @ApiOkResponse({
    description: 'Reviews retrieved successfully',
    type: PaginatedReviewsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Agency not found',
  })
  async listReviews(
    @Param('license') license: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('candidate_id') candidateId?: string,
  ): Promise<PaginatedReviewsResponseDto> {
    // Get agency by license
    const agency = await this.agencyService.findAgencyByLicense(license);

    // Parse pagination parameters
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 10;

    // Validate candidateId if provided
    if (candidateId) {
      try {
        new ParseUUIDPipe().transform(candidateId, {
          type: 'param',
          metatype: String,
          data: 'candidate_id',
        });
      } catch (e) {
        throw new BadRequestException('Invalid candidate_id format');
      }
    }

    return this.reviewService.listReviewsByAgency(agency.id, pageNum, limitNum, candidateId);
  }
}
