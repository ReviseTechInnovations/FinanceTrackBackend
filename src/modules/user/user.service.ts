import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { UserStatus } from '../../common/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UtilsService } from '../../common/services/utils.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private utilsService: UtilsService
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserDto
  ): Promise<User> {
    const user = await this.findById(userId);

    // Update user fields
    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.findById(userId);

    // Verify current password
    const isCurrentPasswordValid = await this.utilsService.comparePassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await this.utilsService.hashPassword(newPassword);

    // Update password
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async deactivateAccount(userId: number): Promise<{ message: string }> {
    const user = await this.findById(userId);

    user.status = UserStatus.SUSPENDED;
    await this.userRepository.save(user);

    return { message: 'Account deactivated successfully' };
  }

  async deleteAccount(userId: number): Promise<{ message: string }> {
    const user = await this.findById(userId);

    user.status = UserStatus.DELETED;
    await this.userRepository.save(user);

    return { message: 'Account deleted successfully' };
  }

  async getUserStats(userId: number): Promise<any> {
    const user = await this.findById(userId);

    // Get basic stats - since accounts and projects entities were removed,
    // we'll return basic user information instead
    return {
      memberSince: user.createdAt,
      lastLogin: user.lastLoginAt,
      accountStatus: user.status,
      emailVerified: user.isEmailVerified,
      emailVerifiedAt: user.emailVerifiedAt
    };
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      users,
      total,
      page,
      limit
    };
  }

  async updateUserStatus(userId: number, status: UserStatus): Promise<User> {
    const user = await this.findById(userId);
    user.status = status;
    return this.userRepository.save(user);
  }
}
