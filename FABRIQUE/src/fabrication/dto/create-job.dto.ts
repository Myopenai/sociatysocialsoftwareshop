import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum JobType {
  PRINT_3D = '3D Print',
  CNC = 'CNC',
  LASER_CUT = 'Laser Cut',
  ASSEMBLY = 'Assembly',
}

export class CreateJobDto {
  @ApiProperty({
    description: 'Type of the fabrication job',
    enum: JobType,
    example: JobType.PRINT_3D,
  })
  @IsNotEmpty()
  @IsEnum(JobType)
  type: JobType;

  @ApiPropertyOptional({
    description: 'Priority of the job (1-10)',
    minimum: 1,
    maximum: 10,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({
    description: 'Additional notes about the job',
    example: 'Handle with care',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
    example: 120,
  })
  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;
}

export class JobResponseDto {
  @ApiProperty({ description: 'Unique identifier of the job' })
  id: number;

  @ApiProperty({ enum: JobType, description: 'Type of the fabrication job' })
  type: JobType;

  @ApiProperty({ enum: JobStatus, description: 'Current status of the job' })
  status: JobStatus;

  @ApiProperty({ description: 'When the job was created', type: String, format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'When the job was started', type: String, format: 'date-time' })
  startedAt?: Date;

  @ApiPropertyOptional({ description: 'When the job was completed', type: String, format: 'date-time' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Priority of the job (1-10)', minimum: 1, maximum: 10 })
  priority?: number;

  @ApiPropertyOptional({ description: 'Additional notes about the job' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Actual duration in minutes' })
  actualDuration?: number;

  @ApiPropertyOptional({ description: 'Error message if the job failed' })
  error?: string;
}

export class StartJobResponseDto {
  @ApiProperty({ description: 'Indicates if the job was started successfully' })
  success: boolean;

  @ApiProperty({ description: 'The created job details', type: JobResponseDto })
  data: JobResponseDto;

  @ApiProperty({ description: 'Message about the operation result' })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ description: 'Error type/name' })
  error: string;

  @ApiPropertyOptional({ description: 'Timestamp of when the error occurred' })
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Request path' })
  path?: string;

  @ApiPropertyOptional({ description: 'Validation errors if any', type: [String] })
  validationErrors?: string[];
}

export class ValidationErrorResponseDto {
  @ApiProperty({ description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ description: 'Error type/name' })
  error: string;

  @ApiProperty({ 
    description: 'Validation error details',
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  })
  validationErrors: Record<string, string[]>;

  @ApiProperty({ description: 'Timestamp of when the error occurred' })
  timestamp: string;

  @ApiProperty({ description: 'Request path' })
  path: string;
}
