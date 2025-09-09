import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto, ResendOtpDto } from './dto/verify-otp.dto';
import {
  AuthResponseDto,
  RegisterResponseDto,
  VerifyOtpResponseDto,
  ResendOtpResponseDto
} from './dto/auth-response.dto';
import { User } from '../../database/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: RegisterResponseDto
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(
    @Body() registerDto: RegisterDto,
    @Request() req: any
  ): Promise<RegisterResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP for email confirmation' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    type: VerifyOtpResponseDto
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Request() req: any
  ): Promise<VerifyOtpResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.verifyOtp(verifyOtpDto, ipAddress);
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP for email verification' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: ResendOtpResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified or rate limited'
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendOtp(
    @Body() resendOtpDto: ResendOtpDto,
    @Request() req: any
  ): Promise<ResendOtpResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.resendOtp(resendOtpDto.email, ipAddress, userAgent);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: any
  ): Promise<AuthResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Request() req: any): Promise<AuthResponseDto> {
    const refreshToken = req.body.refreshToken;
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' }
      }
    }
  })
  async logout(@CurrentUser() user: User): Promise<{ message: string }> {
    return this.authService.logout(user.id);
  }
}
