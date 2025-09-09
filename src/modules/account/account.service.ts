import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountStatus } from '../../database/entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UtilsService } from '../../common/services/utils.service';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private utilsService: UtilsService
  ) {}

  async createAccount(
    userId: number,
    createAccountDto: CreateAccountDto
  ): Promise<Account> {
    const account = this.accountRepository.create({
      ...createAccountDto,
      userId,
      status: AccountStatus.ACTIVE
    });

    return this.accountRepository.save(account);
  }

  async getAllAccounts(
    userId: number,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    accounts: Account[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .where('account.userId = :userId', { userId })
      .leftJoinAndSelect('account.transactions', 'transactions');

    if (search) {
      queryBuilder.andWhere(
        '(account.name ILIKE :search OR account.bankName ILIKE :search OR account.accountNumber ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [accounts, total] = await queryBuilder
      .orderBy('account.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      accounts,
      total,
      page,
      limit
    };
  }

  async getAccountById(userId: number, accountId: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
      relations: ['transactions']
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async updateAccount(
    userId: number,
    accountId: number,
    updateAccountDto: UpdateAccountDto
  ): Promise<Account> {
    const account = await this.getAccountById(userId, accountId);

    Object.assign(account, updateAccountDto);
    return this.accountRepository.save(account);
  }

  async deleteAccount(
    userId: number,
    accountId: number
  ): Promise<{ message: string }> {
    const account = await this.getAccountById(userId, accountId);

    // Check if account has transactions
    if (account.transactions && account.transactions.length > 0) {
      throw new BadRequestException(
        'Cannot delete account with existing transactions'
      );
    }

    await this.accountRepository.remove(account);

    return { message: 'Account deleted successfully' };
  }

  async getAccountSummary(userId: number): Promise<any> {
    const accounts = await this.accountRepository.find({
      where: { userId, status: AccountStatus.ACTIVE }
    });

    const bankingAccounts = accounts.filter((a) =>
      ['checking', 'savings'].includes(a.type)
    );
    const creditCards = accounts.filter((a) => a.type === 'credit_card');

    const totalBalance = accounts.reduce((sum, account) => {
      return (
        sum +
        (account.type === 'credit_card'
          ? account.creditLimit - account.balance
          : account.balance)
      );
    }, 0);

    return {
      totalAccounts: accounts.length,
      totalBalance,
      bankingAccounts: bankingAccounts.length,
      creditCards: creditCards.length,
      accounts: accounts.map((account) => ({
        id: account.id,
        name: account.name,
        bankName: account.bankName,
        type: account.type,
        balance: account.balance,
        currentBalance: account.currentBalance,
        accountNumber: account.maskedAccountNumber,
        lastActivity: account.lastActivity,
        status: account.status
      }))
    };
  }

  async getAccountTransactions(
    userId: number,
    accountId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const account = await this.getAccountById(userId, accountId);

    const transactions = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.transactions', 'transactions')
      .where('account.id = :accountId', { accountId })
      .andWhere('account.userId = :userId', { userId })
      .orderBy('transactions.transactionDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getOne();

    if (!transactions) {
      throw new NotFoundException('Account not found');
    }

    return {
      account: {
        id: account.id,
        name: account.name,
        bankName: account.bankName,
        type: account.type,
        balance: account.balance,
        accountNumber: account.maskedAccountNumber
      },
      transactions: transactions.transactions.map((t) => ({
        id: t.id,
        description: t.description,
        merchant: t.merchant,
        amount: t.amount,
        type: t.type,
        category: t.category,
        transactionDate: t.transactionDate,
        uploadedDate: t.uploadedDate,
        balance: t.balance,
        referenceNumber: t.referenceNumber,
        notes: t.notes
      }))
    };
  }
}
