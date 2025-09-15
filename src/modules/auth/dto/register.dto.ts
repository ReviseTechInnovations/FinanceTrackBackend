import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Matches
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  password: string;

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
