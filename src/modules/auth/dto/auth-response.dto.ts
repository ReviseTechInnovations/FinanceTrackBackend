import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../database/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty()
  user: User;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ example: 3600 })
  expiresIn: number;
}

export class RegisterResponseDto {
  @ApiProperty({
    example:
      'Registration successful. Please check your email for OTP verification.'
  })
  message: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 600 })
  otpExpirySeconds: number;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ example: 'Email verified successfully.' })
  message: string;

  @ApiProperty()
  user: User;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class ResendOtpResponseDto {
  @ApiProperty({ example: 'OTP sent successfully to your email.' })
  message: string;

  @ApiProperty({ example: 600 })
  otpExpirySeconds: number;
}
