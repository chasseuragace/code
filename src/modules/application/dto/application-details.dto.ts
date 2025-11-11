import { ApiProperty } from '@nestjs/swagger';

class JobDetailsDto {
  @ApiProperty({ description: 'Job title', example: 'AC Technician' })
  title: string;

  @ApiProperty({ description: 'Company name', example: 'Al Futtaim Group' })
  company: string;

  @ApiProperty({ description: 'Job location', example: 'Dubai, UAE' })
  location: string;

  @ApiProperty({ description: 'Job category', example: 'Maintenance / HVAC' })
  category: string;

  @ApiProperty({ description: 'Salary range', example: 'AED 1800 - 2200' })
  salary: string;

  @ApiProperty({ description: 'Contract duration', example: '2 Years Contract' })
  contract: string;

  @ApiProperty({ description: 'Accommodation details', example: 'Provided by Employer' })
  accommodation: string;

  @ApiProperty({ description: 'Working hours', example: '8 hrs/day, 6 days/week' })
  workingHours: string;

  @ApiProperty({ description: 'Job description', example: 'We are seeking an experienced AC Technician...' })
  description: string;
}

class InterviewDetailsDto {
  @ApiProperty({ description: 'Interview date', example: '20 Oct 2025' })
  date: string;

  @ApiProperty({ description: 'Interview time', example: '10:00 AM' })
  time: string;

  @ApiProperty({ description: 'Interview mode', example: 'Online via Zoom' })
  mode: string;

  @ApiProperty({ description: 'Interview link', example: 'https://zoom.us/12345', required: false })
  link?: string;

  @ApiProperty({ description: 'Required documents', type: [String], example: ['Passport Copy', 'Experience Certificate'] })
  documents: string[];

  @ApiProperty({ description: 'Contact person name', example: 'Mr. Ahmed' })
  contactPerson: string;

  @ApiProperty({ description: 'Contact person role', example: 'HR Officer' })
  contactRole: string;

  @ApiProperty({ description: 'Contact phone number', example: '+971 55 123 4567' })
  contactPhone: string;

  @ApiProperty({ description: 'Contact email', example: 'hr@alfuttaim.com' })
  contactEmail: string;
}

class EmployerDetailsDto {
  @ApiProperty({ description: 'Company name', example: 'Al Futtaim Group' })
  name: string;

  @ApiProperty({ description: 'Country', example: 'UAE' })
  country: string;

  @ApiProperty({ description: 'Agency name', example: 'Brightway Manpower Pvt. Ltd.' })
  agency: string;

  @ApiProperty({ description: 'Government license number', example: 'Govt. License No. 1234/067/68' })
  license: string;

  @ApiProperty({ description: 'Agency phone number', example: '+977 9812345678' })
  agencyPhone: string;

  @ApiProperty({ description: 'Agency email', example: 'info@brightway.com' })
  agencyEmail: string;

  @ApiProperty({ description: 'Agency address', example: 'Maitidevi, Kathmandu' })
  agencyAddress: string;
}

class DocumentDto {
  @ApiProperty({ description: 'Document name', example: 'CV.pdf' })
  name: string;

  @ApiProperty({ description: 'Document size', example: '245 KB' })
  size: string;
}

export class ApplicationDetailsDto {
  @ApiProperty({ description: 'Application ID', example: 'APP2025-00123' })
  id: string;

  @ApiProperty({ description: 'Date when application was submitted', example: '12 Sept 2025' })
  appliedOn: string;

  @ApiProperty({ description: 'Date when application was last updated', example: '20 Sept 2025' })
  lastUpdated: string;

  @ApiProperty({ 
    description: 'Current application status',
    example: 'Interview Scheduled',
    enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Rescheduled', 'Interview Passed', 'Interview Failed', 'Withdrawn']
  })
  status: string;

  @ApiProperty({ description: 'Application remarks/notes', example: 'Documents verified, waiting for interview confirmation' })
  remarks: string;

  @ApiProperty({ description: 'Application progress (0-5)', example: 2, minimum: 0, maximum: 5 })
  progress: number;

  @ApiProperty({ description: 'Job details', type: JobDetailsDto })
  job: JobDetailsDto;

  @ApiProperty({ description: 'Interview details', type: InterviewDetailsDto, required: false })
  interview?: InterviewDetailsDto;

  @ApiProperty({ description: 'Employer details', type: EmployerDetailsDto })
  employer: EmployerDetailsDto;

  @ApiProperty({ description: 'Application documents', type: [DocumentDto] })
  documents: DocumentDto[];
}
