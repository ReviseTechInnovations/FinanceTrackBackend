import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UtilsService {
  /**
   * Generate a random OTP code
   */
  generateOtp(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Generate a unique UUID
   */
  generateUuid(): string {
    return uuidv4();
  }

  /**
   * Hash a password
   */
  async hashPassword(password: string, rounds: number = 12): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a random string
   */
  generateRandomString(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Calculate percentage change
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Mask sensitive data
   */
  maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars) return data;
    const visible = data.slice(-visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + visible;
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * Generate account number
   */
  generateAccountNumber(): string {
    const random = Math.floor(Math.random() * 10000);
    return random.toString().padStart(4, '0');
  }

  /**
   * Calculate days between dates
   */
  daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  }

  /**
   * Get start and end of month
   */
  getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    return { start, end };
  }
}
