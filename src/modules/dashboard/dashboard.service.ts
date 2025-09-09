import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Account } from '../../database/entities/account.entity';
import {
  Transaction,
  TransactionType,
  TransactionCategory
} from '../../database/entities/transaction.entity';
import { UtilsService } from '../../common/services/utils.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private utilsService: UtilsService
  ) {}

  async getDashboardData(userId: number): Promise<any> {
    const accounts = await this.accountRepository.find({
      where: { userId, status: 'active' }
    });

    const { start: monthStart, end: monthEnd } =
      this.utilsService.getMonthRange();
    const { start: lastMonthStart, end: lastMonthEnd } =
      this.utilsService.getMonthRange(
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      );

    // Get current month transactions
    const currentMonthTransactions = await this.transactionRepository.find({
      where: {
        userId,
        transactionDate: Between(monthStart, monthEnd),
        status: 'completed'
      }
    });

    // Get last month transactions
    const lastMonthTransactions = await this.transactionRepository.find({
      where: {
        userId,
        transactionDate: Between(lastMonthStart, lastMonthEnd),
        status: 'completed'
      }
    });

    // Calculate balances
    const totalBalance = accounts.reduce((sum, account) => {
      return (
        sum +
        (account.type === 'credit_card'
          ? account.creditLimit - account.balance
          : account.balance)
      );
    }, 0);

    // Calculate monthly income
    const currentMonthIncome = currentMonthTransactions
      .filter((t) => t.type === TransactionType.CREDIT)
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthIncome = lastMonthTransactions
      .filter((t) => t.type === TransactionType.CREDIT)
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate monthly expenses
    const currentMonthExpenses = currentMonthTransactions
      .filter((t) => t.type === TransactionType.DEBIT)
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter((t) => t.type === TransactionType.DEBIT)
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate percentage changes
    const incomeChange = this.utilsService.calculatePercentageChange(
      currentMonthIncome,
      lastMonthIncome
    );
    const expenseChange = this.utilsService.calculatePercentageChange(
      currentMonthExpenses,
      lastMonthExpenses
    );

    // Get expense breakdown
    const expenseBreakdown = this.getExpenseBreakdown(currentMonthTransactions);

    // Get recent transactions
    const recentTransactions = await this.transactionRepository.find({
      where: { userId, status: 'completed' },
      order: { transactionDate: 'DESC' },
      take: 10,
      relations: ['account']
    });

    // Get income vs expenses chart data (last 6 months)
    const incomeVsExpenses = await this.getIncomeVsExpensesChart(userId);

    return {
      summary: {
        totalBalance: {
          amount: totalBalance,
          change: 3.2, // This would be calculated based on previous period
          trend: 'up'
        },
        monthlyIncome: {
          amount: currentMonthIncome,
          change: incomeChange,
          trend: incomeChange >= 0 ? 'up' : 'down'
        },
        monthlyExpenses: {
          amount: currentMonthExpenses,
          change: expenseChange,
          trend: expenseChange >= 0 ? 'up' : 'down'
        }
      },
      expenseBreakdown,
      incomeVsExpenses,
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        description: t.description,
        merchant: t.merchant,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.transactionDate,
        account: {
          name: t.account.name,
          type: t.account.type
        }
      }))
    };
  }

  private getExpenseBreakdown(transactions: Transaction[]): any {
    const expenses = transactions.filter(
      (t) => t.type === TransactionType.DEBIT
    );
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    const breakdown = expenses.reduce(
      (acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = { amount: 0, percentage: 0 };
        }
        acc[category].amount += transaction.amount;
        return acc;
      },
      {} as Record<string, { amount: number; percentage: number }>
    );

    // Calculate percentages
    Object.keys(breakdown).forEach((category) => {
      breakdown[category].percentage =
        (breakdown[category].amount / totalExpenses) * 100;
    });

    return {
      total: totalExpenses,
      categories: Object.entries(breakdown).map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: Math.round(data.percentage * 100) / 100
      }))
    };
  }

  private async getIncomeVsExpensesChart(userId: number): Promise<any> {
    const months = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const { start, end } = this.utilsService.getMonthRange(date);

      const transactions = await this.transactionRepository.find({
        where: {
          userId,
          transactionDate: Between(start, end),
          status: 'completed'
        }
      });

      const income = transactions
        .filter((t) => t.type === TransactionType.CREDIT)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter((t) => t.type === TransactionType.DEBIT)
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income,
        expenses
      });
    }

    return months;
  }

  async getAccountSummary(userId: number): Promise<any> {
    const accounts = await this.accountRepository.find({
      where: { userId, status: 'active' }
    });

    const bankingAccounts = accounts.filter((a) =>
      ['checking', 'savings'].includes(a.type)
    );
    const creditCards = accounts.filter((a) => a.type === 'credit_card');

    return {
      bankingAccounts: bankingAccounts.map((account) => ({
        id: account.id,
        name: account.name,
        bankName: account.bankName,
        type: account.type,
        balance: account.balance,
        accountNumber: account.maskedAccountNumber,
        lastActivity: account.lastActivity,
        interestRate: account.interestRate
      })),
      creditCards: creditCards.map((account) => ({
        id: account.id,
        name: account.name,
        bankName: account.bankName,
        currentBalance: account.balance,
        availableCredit: account.availableCredit,
        creditLimit: account.creditLimit,
        accountNumber: account.maskedAccountNumber,
        lastActivity: account.lastActivity
      }))
    };
  }
}
