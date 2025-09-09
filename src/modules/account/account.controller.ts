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
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from '../../database/entities/account.entity';
import { User } from '../../database/entities/user.entity';

@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: Account
  })
  async createAccount(
    @CurrentUser() user: User,
    @Body() createAccountDto: CreateAccountDto
  ): Promise<Account> {
    return this.accountService.createAccount(user.id, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'chase' })
  @ApiResponse({
    status: 200,
    description: 'Accounts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        accounts: {
          type: 'array',
          items: { $ref: '#/components/schemas/Account' }
        },
        total: { type: 'number', example: 5 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 }
      }
    }
  })
  async getAllAccounts(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string
  ): Promise<{
    accounts: Account[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.accountService.getAllAccounts(user.id, page, limit, search);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get account summary' })
  @ApiResponse({
    status: 200,
    description: 'Account summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalAccounts: { type: 'number', example: 3 },
        totalBalance: { type: 'number', example: 18542.32 },
        bankingAccounts: { type: 'number', example: 2 },
        creditCards: { type: 'number', example: 1 },
        accounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Chase Premium Checking' },
              bankName: { type: 'string', example: 'Chase Bank' },
              type: { type: 'string', example: 'checking' },
              balance: { type: 'number', example: 4526.85 },
              currentBalance: { type: 'number', example: 4526.85 },
              accountNumber: { type: 'string', example: '****7774' },
              lastActivity: {
                type: 'string',
                example: '2023-08-12T00:00:00.000Z'
              },
              status: { type: 'string', example: 'active' }
            }
          }
        }
      }
    }
  })
  async getAccountSummary(@CurrentUser() user: User): Promise<any> {
    return this.accountService.getAccountSummary(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved successfully',
    type: Account
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccountById(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) accountId: number
  ): Promise<Account> {
    return this.accountService.getAccountById(user.id, accountId);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get account transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Account transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        account: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Chase Premium Checking' },
            bankName: { type: 'string', example: 'Chase Bank' },
            type: { type: 'string', example: 'checking' },
            balance: { type: 'number', example: 4526.85 },
            accountNumber: { type: 'string', example: '****7774' }
          }
        },
        transactions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              description: { type: 'string', example: 'Starbucks Coffee' },
              merchant: { type: 'string', example: 'Starbucks' },
              amount: { type: 'number', example: 5.45 },
              type: { type: 'string', example: 'debit' },
              category: { type: 'string', example: 'dining' },
              transactionDate: {
                type: 'string',
                example: '2023-08-12T00:00:00.000Z'
              },
              uploadedDate: {
                type: 'string',
                example: '2023-08-12T00:00:00.000Z'
              },
              balance: { type: 'number', example: 2450.55 },
              referenceNumber: { type: 'string', example: 'TXN123456789' },
              notes: { type: 'string', example: 'Online purchase' }
            }
          }
        }
      }
    }
  })
  async getAccountTransactions(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) accountId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20
  ): Promise<any> {
    return this.accountService.getAccountTransactions(
      user.id,
      accountId,
      page,
      limit
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
    type: Account
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async updateAccount(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) accountId: number,
    @Body() updateAccountDto: UpdateAccountDto
  ): Promise<Account> {
    return this.accountService.updateAccount(
      user.id,
      accountId,
      updateAccountDto
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Account deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete account with transactions'
  })
  async deleteAccount(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) accountId: number
  ): Promise<{ message: string }> {
    return this.accountService.deleteAccount(user.id, accountId);
  }
}
