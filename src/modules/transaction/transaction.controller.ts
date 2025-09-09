import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from '../../database/entities/transaction.entity';
import { User } from '../../database/entities/user.entity';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: Transaction
  })
  async createTransaction(
    @CurrentUser() user: User,
    @Body() createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    return this.transactionService.createTransaction(
      user.id,
      createTransactionDto
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'starbucks'
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    example: 'dining'
  })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'debit' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2023-08-01'
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2023-08-31'
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        transactions: {
          type: 'array',
          items: { $ref: '#/components/schemas/Transaction' }
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 }
      }
    }
  })
  async getAllTransactions(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.transactionService.getAllTransactions(
      user.id,
      page,
      limit,
      search,
      category,
      type,
      startDate,
      endDate
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2023-08-01'
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2023-08-31'
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalTransactions: { type: 'number', example: 150 },
        totalIncome: { type: 'number', example: 4200.0 },
        totalExpenses: { type: 'number', example: 2500.0 },
        netIncome: { type: 'number', example: 1700.0 },
        categoryBreakdown: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string', example: 'dining' },
              count: { type: 'number', example: 25 },
              total: { type: 'number', example: 450.0 },
              average: { type: 'number', example: 18.0 }
            }
          }
        }
      }
    }
  })
  async getTransactionStats(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<any> {
    return this.transactionService.getTransactionStats(
      user.id,
      startDate,
      endDate
    );
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent transactions' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Recent transactions retrieved successfully',
    type: [Transaction]
  })
  async getRecentTransactions(
    @CurrentUser() user: User,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
  ): Promise<Transaction[]> {
    return this.transactionService.getRecentTransactions(user.id, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    type: Transaction
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionById(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) transactionId: number
  ): Promise<Transaction> {
    return this.transactionService.getTransactionById(user.id, transactionId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: Transaction
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updateTransaction(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) transactionId: number,
    @Body() updateTransactionDto: UpdateTransactionDto
  ): Promise<Transaction> {
    return this.transactionService.updateTransaction(
      user.id,
      transactionId,
      updateTransactionDto
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Transaction deleted successfully'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async deleteTransaction(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) transactionId: number
  ): Promise<{ message: string }> {
    return this.transactionService.deleteTransaction(user.id, transactionId);
  }
}
