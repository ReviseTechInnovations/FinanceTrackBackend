import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  MinLength,
  MaxLength
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ example: 'john.doe@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Main St, New York, NY 10001', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: '1234', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  ssn?: string;
}
