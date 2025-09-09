import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            totalBalance: {
              type: 'object',
              properties: {
                amount: { type: 'number', example: 18542.32 },
                change: { type: 'number', example: 3.2 },
                trend: { type: 'string', example: 'up' }
              }
            },
            monthlyIncome: {
              type: 'object',
              properties: {
                amount: { type: 'number', example: 4200.0 },
                change: { type: 'number', example: -5.3 },
                trend: { type: 'string', example: 'down' }
              }
            },
            monthlyExpenses: {
              type: 'object',
              properties: {
                amount: { type: 'number', example: 1500.84 },
                change: { type: 'number', example: 3.2 },
                trend: { type: 'string', example: 'up' }
              }
            }
          }
        },
        expenseBreakdown: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 2500 },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string', example: 'housing' },
                  amount: { type: 'number', example: 1200 },
                  percentage: { type: 'number', example: 48 }
                }
              }
            }
          }
        },
        incomeVsExpenses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string', example: 'Jan' },
              income: { type: 'number', example: 4200 },
              expenses: { type: 'number', example: 2500 }
            }
          }
        },
        recentTransactions: {
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
              date: { type: 'string', example: '2023-08-12T00:00:00.000Z' },
              account: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Chase Premium Checking' },
                  type: { type: 'string', example: 'checking' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getDashboardData(@CurrentUser() user: User): Promise<any> {
    return this.dashboardService.getDashboardData(user.id);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get account summary' })
  @ApiResponse({
    status: 200,
    description: 'Account summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        bankingAccounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Chase Premium Checking' },
              bankName: { type: 'string', example: 'Chase Bank' },
              type: { type: 'string', example: 'checking' },
              balance: { type: 'number', example: 4526.85 },
              accountNumber: { type: 'string', example: '****7774' },
              lastActivity: {
                type: 'string',
                example: '2023-08-12T00:00:00.000Z'
              },
              interestRate: { type: 'number', example: 3.2 }
            }
          }
        },
        creditCards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Chase Freedom' },
              bankName: { type: 'string', example: 'Chase Bank' },
              currentBalance: { type: 'number', example: 1145.0 },
              availableCredit: { type: 'number', example: 8850.0 },
              creditLimit: { type: 'number', example: 10000.0 },
              accountNumber: { type: 'string', example: '****3507' },
              lastActivity: {
                type: 'string',
                example: '2023-08-12T00:00:00.000Z'
              }
            }
          }
        }
      }
    }
  })
  async getAccountSummary(@CurrentUser() user: User): Promise<any> {
    return this.dashboardService.getAccountSummary(user.id);
  }
}
