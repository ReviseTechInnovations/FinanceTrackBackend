import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Account } from './account.entity';

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  TRANSFER = 'transfer'
}

export enum TransactionCategory {
  INCOME = 'income',
  DINING = 'dining',
  SHOPPING = 'shopping',
  UTILITIES = 'utilities',
  TRANSPORTATION = 'transportation',
  ENTERTAINMENT = 'entertainment',
  HOUSING = 'housing',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  TRAVEL = 'travel',
  TRANSFER = 'transfer',
  OTHER = 'other'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

@Entity('transactions')
export class Transaction {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Starbucks Coffee' })
  @Column({ length: 200 })
  description: string;

  @ApiProperty({ example: 'Starbucks' })
  @Column({ length: 100, nullable: true })
  merchant: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.DEBIT })
  @Column({
    type: 'enum',
    enum: TransactionType
  })
  type: TransactionType;

  @ApiProperty({
    enum: TransactionCategory,
    example: TransactionCategory.DINING
  })
  @Column({
    type: 'enum',
    enum: TransactionCategory
  })
  category: TransactionCategory;

  @ApiProperty({
    enum: TransactionStatus,
    example: TransactionStatus.COMPLETED
  })
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED
  })
  status: TransactionStatus;

  @ApiProperty({ example: 5.45 })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({ example: 2450.55 })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  balance: number;

  @ApiProperty({ example: '2023-08-12T00:00:00.000Z' })
  @Column({ type: 'timestamp' })
  transactionDate: Date;

  @ApiProperty({ example: '2023-08-12T00:00:00.000Z' })
  @Column({ type: 'timestamp' })
  uploadedDate: Date;

  @ApiProperty({ example: 'TXN123456789' })
  @Column({ length: 100, nullable: true })
  referenceNumber: string;

  @ApiProperty({ example: 'Online purchase' })
  @Column({ type: 'text', nullable: true })
  notes: string;

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

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ example: 1 })
  @Column()
  @Index()
  accountId: number;

  @ManyToOne(() => Account, (account) => account.transactions)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  // Virtual properties
  get isDebit(): boolean {
    return this.type === TransactionType.DEBIT;
  }

  get isCredit(): boolean {
    return this.type === TransactionType.CREDIT;
  }

  get formattedAmount(): string {
    const sign = this.isDebit ? '-' : '+';
    return `${sign}$${Math.abs(this.amount).toFixed(2)}`;
  }
}
