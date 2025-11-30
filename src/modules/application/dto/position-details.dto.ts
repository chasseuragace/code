import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PositionDetailsDto {
  @ApiProperty({ 
    description: 'Position ID', 
    example: '2f4a8d3b-1c5e-4f7a-9d2c-8e3f6a5b4d7e',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the position',
    example: 'Senior Electrician'
  })
  title: string;

  @ApiProperty({
    description: 'Number of vacancies available for this position',
    example: 5
  })
  vacancies: number;

  
  @ApiPropertyOptional({
        description: 'Salary range for this position',
        example: '3000-4000 USD',
        required: false
      })
    salary_range?: string;

  
  @ApiPropertyOptional({
        description: 'Experience required for this position',
        example: '5+ years',
        required: false
      })
    experience_required?: string;

  
  @ApiPropertyOptional({
        description: 'Skills required for this position',
        type: [String],
        example: ['Electrical Wiring', 'Maintenance', 'Troubleshooting'],
        required: false
      })
    skills_required?: string[];
}
