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
  TaskStatus,
  TaskPriority
} from '../../../database/entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ example: 'Homepage Layout' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Create responsive homepage layout with modern design...',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.TODO, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    required: false
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ example: 'AC-001' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  taskCode: string;

  @ApiProperty({ example: '2023-08-25', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  projectId: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  assignedToId?: number;
}
