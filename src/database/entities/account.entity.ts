import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT_CARD = 'credit_card',
  INVESTMENT = 'investment',
  LOAN = 'loan'
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CLOSED = 'closed'
}

@Entity('accounts')
export class Account {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Chase Premium Checking' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ example: 'Chase Bank' })
  @Column({ length: 100 })
  bankName: string;

  @ApiProperty({ enum: AccountType, example: AccountType.CHECKING })
  @Column({
    type: 'enum',
    enum: AccountType
  })
  type: AccountType;

  @ApiProperty({ enum: AccountStatus, example: AccountStatus.ACTIVE })
  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE
  })
  status: AccountStatus;

  @ApiProperty({ example: '4567' })
  @Column({ length: 20 })
  accountNumber: string;

  @ApiProperty({ example: '7844 4894 7774' })
  @Column({ length: 50, nullable: true })
  fullAccountNumber: string;

  @ApiProperty({ example: 4526.85 })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @ApiProperty({ example: 200.0 })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pendingBalance: number;

  @ApiProperty({ example: 10000.0 })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditLimit: number;

  @ApiProperty({ example: 8850.0 })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  availableCredit: number;

  @ApiProperty({ example: 3.2 })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Column({ nullable: true })
  lastActivity: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({ example: 1 })
  @Column()
  @Index()
  userId: number;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];

  // Virtual properties
  get maskedAccountNumber(): string {
    if (this.fullAccountNumber) {
      return this.fullAccountNumber.replace(/\d(?=\d{4})/g, '*');
    }
    return this.accountNumber;
  }

  get isCreditCard(): boolean {
    return this.type === AccountType.CREDIT_CARD;
  }

  get currentBalance(): number {
    return this.isCreditCard ? this.creditLimit - this.balance : this.balance;
  }
}
