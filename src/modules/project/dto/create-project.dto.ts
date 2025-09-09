import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  MinLength,
  MaxLength
} from 'class-validator';
import {
  ProjectStatus,
  ProjectPriority
} from '../../../database/entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({ example: 'Apollo Authentication flow revamp' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'AC-001' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  projectCode: string;

  @ApiProperty({
    example:
      'Redesign login, signup, and reset flows. Add social auth, enforce password rules, rate limiting, and device trust.'
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: ProjectStatus.PLANNING,
    required: false
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({
    enum: ProjectPriority,
    example: ProjectPriority.HIGH,
    required: false
  })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiProperty({ example: 'Apollo LTD' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  client: string;

  @ApiProperty({ example: '2023-08-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2023-08-28', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: 10000.0, required: false })
  @IsOptional()
  @IsNumber()
  budget?: number;
}
