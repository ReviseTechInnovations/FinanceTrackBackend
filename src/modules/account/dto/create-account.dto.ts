import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  MinLength,
  MaxLength,
  Min
} from 'class-validator';
import { AccountType } from '../../../database/entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ example: 'Chase Premium Checking' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Chase Bank' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  bankName: string;

  @ApiProperty({ enum: AccountType, example: AccountType.CHECKING })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({ example: '4567' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  accountNumber: string;

  @ApiProperty({ example: '7844 4894 7774', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fullAccountNumber?: string;

  @ApiProperty({ example: 4526.85, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @ApiProperty({ example: 200.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pendingBalance?: number;

  @ApiProperty({ example: 10000.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiProperty({ example: 8850.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableCredit?: number;

  @ApiProperty({ example: 3.2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;
}
