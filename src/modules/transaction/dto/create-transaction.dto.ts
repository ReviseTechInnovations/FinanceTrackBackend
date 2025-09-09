import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  MinLength,
  MaxLength,
  Min
} from 'class-validator';
import {
  TransactionType,
  TransactionCategory
} from '../../../database/entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ example: 'Starbucks Coffee' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  description: string;

  @ApiProperty({ example: 'Starbucks', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  merchant?: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.DEBIT })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    enum: TransactionCategory,
    example: TransactionCategory.DINING
  })
  @IsEnum(TransactionCategory)
  category: TransactionCategory;

  @ApiProperty({ example: 5.45 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: '2023-08-12T00:00:00.000Z' })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({ example: 'TXN123456789', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @ApiProperty({ example: 'Online purchase', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  accountId: number;
}
