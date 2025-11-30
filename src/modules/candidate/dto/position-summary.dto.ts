import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PositionSummaryDto {
  @ApiProperty({ description: 'Position ID', example: '2f4a8d3b-1c5e-4f7a-9d2c-8e3f6a5b4d7e' })
  id: string;

  @ApiProperty({ description: 'Title of the position', example: 'Senior Electrician' })
  title: string;

  @ApiProperty({ description: 'Number of male vacancies', example: 3 })
  male_vacancies: number;

  @ApiProperty({ description: 'Number of female vacancies', example: 2 })
  female_vacancies: number;

  @ApiProperty({ description: 'Total number of vacancies', example: 5 })
  total_vacancies: number;

  @ApiProperty({ description: 'Monthly salary amount', example: 2500 })
  monthly_salary_amount: number;

  @ApiProperty({ description: 'Salary currency', example: 'USD' })
  salary_currency: string;

  
  @ApiPropertyOptional({ 
        description: 'Formatted salary range', 
        example: '2500 USD',
        required: false 
      })
    salary_display?: string;

  
  @ApiPropertyOptional({ 
        description: 'Converted salary amounts',
        type: 'array',
        items: { 
          type: 'object',
          properties: {
            amount: { type: 'number', example: 333333.33 },
            currency: { type: 'string', example: 'NPR' }
          }
        },
        required: false
      })
    converted_salaries?: Array<{ amount: number; currency: string }>;

  
  @ApiPropertyOptional({ 
        description: 'Position notes or description',
        example: 'Experience with industrial electrical systems required',
        required: false 
      })
    notes?: string;

  
  @ApiPropertyOptional({ 
        description: 'Whether the candidate has applied to this position',
        example: true,
        required: false 
      })
    has_applied?: boolean;
}
