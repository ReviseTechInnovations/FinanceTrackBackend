import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum OtpType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  LOGIN_VERIFICATION = 'login_verification'
}

export enum OtpStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  USED = 'used'
}

@Entity('otps')
export class Otp {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '123456' })
  @Column({ length: 10 })
  code: string;

  @ApiProperty({ enum: OtpType, example: OtpType.EMAIL_VERIFICATION })
  @Column({
    type: 'enum',
    enum: OtpType
  })
  type: OtpType;

  @ApiProperty({ enum: OtpStatus, example: OtpStatus.PENDING })
  @Column({
    type: 'enum',
    enum: OtpStatus,
    default: OtpStatus.PENDING
  })
  status: OtpStatus;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Column()
  @Index()
  email: string;

  @ApiProperty({ example: 1 })
  @Column({ nullable: true })
  userId: number;

  @ApiProperty({ example: '2023-01-01T00:10:00.000Z' })
  @Column()
  expiresAt: Date;

  @ApiProperty({ example: 3 })
  @Column({ default: 0 })
  attempts: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Column({ nullable: true })
  verifiedAt: Date;

  @ApiProperty({ example: '192.168.1.1' })
  @Column({ nullable: true })
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  @Column({ nullable: true })
  userAgent: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Methods
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isMaxAttemptsReached(maxAttempts: number = 3): boolean {
    return this.attempts >= maxAttempts;
  }

  canResend(minIntervalMinutes: number = 1): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - this.createdAt.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    return minutesDiff >= minIntervalMinutes;
  }
}
