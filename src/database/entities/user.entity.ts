import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  // OneToMany,
  Index
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus, UserRole } from '../../common/enums';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'John' })
  @Column({ length: 50 })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Column({ length: 50 })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Column({ unique: true })
  @Index()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ example: '123 Main St, New York, NY 10001' })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ example: 'NY' })
  @Column({ length: 50, nullable: true })
  state: string;

  @ApiProperty({ example: '10001' })
  @Column({ length: 20, nullable: true })
  postalCode: string;

  @ApiProperty({ example: '1990-01-01' })
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @ApiProperty({ example: '1234' })
  @Column({ nullable: true })
  ssn: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ enum: UserStatus, example: UserStatus.PENDING })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING
  })
  status: UserStatus;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @ApiProperty({ example: true })
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Column({ nullable: true })
  lastLoginAt: Date;

  @ApiProperty({ example: '192.168.1.1' })
  @Column({ nullable: true })
  lastLoginIp: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations - removed since entities were deleted

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
