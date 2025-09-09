import {
  Controller,
  Get,
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
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User, UserStatus } from '../../database/entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: User
  })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return this.userService.findById(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: User
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.userService.updateProfile(user.id, updateUserDto);
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password changed successfully' }
      }
    }
  })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    return this.userService.changePassword(user.id, changePasswordDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalAccounts: { type: 'number', example: 3 },
        totalProjects: { type: 'number', example: 5 },
        totalBalance: { type: 'number', example: 18542.32 },
        memberSince: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        lastLogin: { type: 'string', example: '2023-08-12T10:30:00.000Z' },
        accountStatus: { type: 'string', example: 'active' }
      }
    }
  })
  async getUserStats(@CurrentUser() user: User): Promise<any> {
    return this.userService.getUserStats(user.id);
  }

  @Put('deactivate')
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({
    status: 200,
    description: 'Account deactivated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Account deactivated successfully'
        }
      }
    }
  })
  async deactivateAccount(
    @CurrentUser() user: User
  ): Promise<{ message: string }> {
    return this.userService.deactivateAccount(user.id);
  }

  @Delete('account')
  @ApiOperation({ summary: 'Delete user account' })
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
  async deleteAccount(@CurrentUser() user: User): Promise<{ message: string }> {
    return this.userService.deleteAccount(user.id);
  }

  // Admin endpoints
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'john' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 }
      }
    }
  })
  async getAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    return this.userService.getAllUsers(page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: User
  })
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: UserStatus
  ): Promise<User> {
    return this.userService.updateUserStatus(id, status);
  }
}
