import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  Transaction,
  TransactionStatus
} from '../../database/entities/transaction.entity';
import { Account } from '../../database/entities/account.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>
  ) {}

  async createTransaction(
    userId: number,
    createTransactionDto: CreateTransactionDto
  ): Promise<Transaction> {
    // Verify account belongs to user
    const account = await this.accountRepository.findOne({
      where: { id: createTransactionDto.accountId, userId }
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Calculate new balance
    let newBalance = account.balance;
    if (createTransactionDto.type === 'debit') {
      newBalance -= createTransactionDto.amount;
    } else {
      newBalance += createTransactionDto.amount;
    }

    // Create transaction
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      userId,
      balance: newBalance,
      status: TransactionStatus.COMPLETED
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Update account balance
    account.balance = newBalance;
    account.lastActivity = new Date(createTransactionDto.transactionDate);
    await this.accountRepository.save(account);

    return savedTransaction;
  }

  async getAllTransactions(
    userId: number,
    page: number = 1,
    limit: number = 20,
    search?: string,
    category?: string,
    type?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .where('transaction.userId = :userId', { userId })
      .andWhere('account.userId = :userId', { userId });

    if (search) {
      queryBuilder.andWhere(
        '(transaction.description ILIKE :search OR transaction.merchant ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('transaction.category = :category', { category });
    }

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'transaction.transactionDate BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate
        }
      );
    }

    const [transactions, total] = await queryBuilder
      .orderBy('transaction.transactionDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      transactions,
      total,
      page,
      limit
    };
  }

  async getTransactionById(
    userId: number,
    transactionId: number
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId },
      relations: ['account']
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async updateTransaction(
    userId: number,
    transactionId: number,
    updateTransactionDto: UpdateTransactionDto
  ): Promise<Transaction> {
    const transaction = await this.getTransactionById(userId, transactionId);

    // If amount or type is being updated, we need to recalculate balances
    if (updateTransactionDto.amount || updateTransactionDto.type) {
      const account = await this.accountRepository.findOne({
        where: { id: transaction.accountId, userId }
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Revert the old transaction
      let revertedBalance = account.balance;
      if (transaction.type === 'debit') {
        revertedBalance += transaction.amount;
      } else {
        revertedBalance -= transaction.amount;
      }

      // Apply the new transaction
      const newAmount = updateTransactionDto.amount || transaction.amount;
      const newType = updateTransactionDto.type || transaction.type;

      if (newType === 'debit') {
        revertedBalance -= newAmount;
      } else {
        revertedBalance += newAmount;
      }

      // Update account balance
      account.balance = revertedBalance;
      await this.accountRepository.save(account);

      // Update transaction
      Object.assign(transaction, updateTransactionDto);
      transaction.balance = revertedBalance;
    } else {
      Object.assign(transaction, updateTransactionDto);
    }

    return this.transactionRepository.save(transaction);
  }

  async deleteTransaction(
    userId: number,
    transactionId: number
  ): Promise<{ message: string }> {
    const transaction = await this.getTransactionById(userId, transactionId);

    // Revert the transaction from account balance
    const account = await this.accountRepository.findOne({
      where: { id: transaction.accountId, userId }
    });

    if (account) {
      let revertedBalance = account.balance;
      if (transaction.type === 'debit') {
        revertedBalance += transaction.amount;
      } else {
        revertedBalance -= transaction.amount;
      }

      account.balance = revertedBalance;
      await this.accountRepository.save(account);
    }

    await this.transactionRepository.remove(transaction);

    return { message: 'Transaction deleted successfully' };
  }

  async getTransactionStats(
    userId: number,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.status = :status', {
        status: TransactionStatus.COMPLETED
      });

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'transaction.transactionDate BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate
        }
      );
    }

    const transactions = await queryBuilder.getMany();

    const totalIncome = transactions
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = transactions.reduce(
      (acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = { count: 0, total: 0 };
        }
        acc[category].count += 1;
        acc[category].total += transaction.amount;
        return acc;
      },
      {} as Record<string, { count: number; total: number }>
    );

    return {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      categoryBreakdown: Object.entries(categoryBreakdown).map(
        ([category, data]) => ({
          category,
          count: data.count,
          total: data.total,
          average: data.total / data.count
        })
      )
    };
  }

  async getRecentTransactions(
    userId: number,
    limit: number = 10
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId, status: TransactionStatus.COMPLETED },
      relations: ['account'],
      order: { transactionDate: 'DESC' },
      take: limit
    });
  }
}
