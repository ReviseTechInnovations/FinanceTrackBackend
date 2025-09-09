import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, UserStatus } from '../../database/entities/user.entity';
import { Otp, OtpType, OtpStatus } from '../../database/entities/otp.entity';
import { UtilsService } from '../../common/services/utils.service';
import { RedisService } from '../../common/services/redis.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import {
  AuthResponseDto,
  RegisterResponseDto,
  VerifyOtpResponseDto,
  ResendOtpResponseDto
} from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private utilsService: UtilsService,
    private redisService: RedisService,
    private emailService: EmailService
  ) {}

  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<RegisterResponseDto> {
    const { email, password, ...userData } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email }
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.utilsService.hashPassword(password);

    // Create user
    const user = this.userRepository.create({
      ...userData,
      email,
      password: hashedPassword,
      status: UserStatus.PENDING
    });

    const savedUser = await this.userRepository.save(user);

    // Generate and send OTP
    const otpCode = this.utilsService.generateOtp();
    const otpExpiryMinutes = this.configService.get('OTP_EXPIRY_MINUTES') || 10;
    const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);

    // Save OTP to database
    const otp = this.otpRepository.create({
      code: otpCode,
      type: OtpType.EMAIL_VERIFICATION,
      email,
      userId: savedUser.id,
      expiresAt,
      ipAddress,
      userAgent
    });

    await this.otpRepository.save(otp);

    // Store OTP in Redis for quick access
    await this.redisService.storeOtp(email, otpCode, otpExpiryMinutes * 60);

    // Send OTP email
    await this.emailService.sendOtpEmail(email, otpCode, savedUser.firstName);

    return {
      message:
        'Registration successful. Please check your email for OTP verification.',
      email,
      otpExpirySeconds: otpExpiryMinutes * 60
    };
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
    ipAddress?: string
  ): Promise<VerifyOtpResponseDto> {
    const { email, otp } = verifyOtpDto;

    // Get user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Get OTP from database
    const otpRecord = await this.otpRepository.findOne({
      where: {
        email,
        code: otp,
        type: OtpType.EMAIL_VERIFICATION,
        status: OtpStatus.PENDING
      },
      order: { createdAt: 'DESC' }
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Check if OTP is expired
    if (otpRecord.isExpired()) {
      otpRecord.status = OtpStatus.EXPIRED;
      await this.otpRepository.save(otpRecord);
      throw new UnauthorizedException('OTP has expired');
    }

    // Check max attempts
    if (otpRecord.isMaxAttemptsReached()) {
      otpRecord.status = OtpStatus.EXPIRED;
      await this.otpRepository.save(otpRecord);
      throw new UnauthorizedException('Maximum OTP attempts exceeded');
    }

    // Verify OTP
    otpRecord.status = OtpStatus.VERIFIED;
    otpRecord.verifiedAt = new Date();
    otpRecord.attempts += 1;
    await this.otpRepository.save(otpRecord);

    // Update user status
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.status = UserStatus.ACTIVE;
    await this.userRepository.save(user);

    // Delete OTP from Redis
    await this.redisService.deleteOtp(email);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Send confirmation email
    await this.emailService.sendConfirmationEmail(email, user.firstName);

    return {
      message: 'Email verified successfully.',
      user,
      ...tokens
    };
  }

  async resendOtp(
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ResendOtpResponseDto> {
    // Get user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Check if user can resend OTP
    const lastOtp = await this.otpRepository.findOne({
      where: {
        email,
        type: OtpType.EMAIL_VERIFICATION
      },
      order: { createdAt: 'DESC' }
    });

    if (lastOtp && !lastOtp.canResend(1)) {
      throw new BadRequestException('Please wait before requesting a new OTP');
    }

    // Generate new OTP
    const otpCode = this.utilsService.generateOtp();
    const otpExpiryMinutes = this.configService.get('OTP_EXPIRY_MINUTES') || 10;
    const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);

    // Save new OTP
    const otp = this.otpRepository.create({
      code: otpCode,
      type: OtpType.EMAIL_VERIFICATION,
      email,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent
    });

    await this.otpRepository.save(otp);

    // Store OTP in Redis
    await this.redisService.storeOtp(email, otpCode, otpExpiryMinutes * 60);

    // Send OTP email
    await this.emailService.sendOtpEmail(email, otpCode, user.firstName);

    return {
      message: 'OTP sent successfully to your email.',
      otpExpirySeconds: otpExpiryMinutes * 60
    };
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    // Verify password
    const isPasswordValid = await this.utilsService.comparePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET')
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub }
      });
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);

      return {
        user,
        ...tokens
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number): Promise<{ message: string }> {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(
    user: User
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '30d'
    });

    const expiresIn = this.configService.get('JWT_EXPIRES_IN') || '7d';
    const expiresInSeconds = this.parseExpiryToSeconds(expiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds
    };
  }

  private parseExpiryToSeconds(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60; // Default to 7 days
    }
  }
}
