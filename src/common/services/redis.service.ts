import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = createClient({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD') || undefined
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  /**
   * Set a key-value pair with optional expiration
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.client.expire(key, ttlSeconds);
    return result;
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /**
   * Increment a counter
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Increment a counter with expiration
   */
  async incrWithExpiry(key: string, ttlSeconds: number): Promise<number> {
    const pipeline = this.client.multi();
    pipeline.incr(key);
    pipeline.expire(key, ttlSeconds);
    const results = await pipeline.exec();
    return results[0] as number;
  }

  /**
   * Store OTP with expiration
   */
  async storeOtp(
    email: string,
    otp: string,
    ttlSeconds: number = 600
  ): Promise<void> {
    const key = `otp:${email}`;
    await this.set(key, otp, ttlSeconds);
  }

  /**
   * Get OTP
   */
  async getOtp(email: string): Promise<string | null> {
    const key = `otp:${email}`;
    return this.get(key);
  }

  /**
   * Delete OTP
   */
  async deleteOtp(email: string): Promise<void> {
    const key = `otp:${email}`;
    await this.del(key);
  }

  /**
   * Store rate limit data
   */
  async storeRateLimit(
    identifier: string,
    ttlSeconds: number = 60
  ): Promise<number> {
    const key = `rate_limit:${identifier}`;
    return this.incrWithExpiry(key, ttlSeconds);
  }

  /**
   * Get rate limit count
   */
  async getRateLimit(identifier: string): Promise<number> {
    const key = `rate_limit:${identifier}`;
    const count = await this.get(key);
    return count ? parseInt(count) : 0;
  }

  /**
   * Store session data
   */
  async storeSession(
    sessionId: string,
    data: any,
    ttlSeconds: number = 86400
  ): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, JSON.stringify(data), ttlSeconds);
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<any> {
    const key = `session:${sessionId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.del(key);
  }
}
