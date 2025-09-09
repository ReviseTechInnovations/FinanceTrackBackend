import { Module } from '@nestjs/common';
import { UtilsService } from './services/utils.service';
import { RedisService } from './services/redis.service';

@Module({
  providers: [UtilsService, RedisService],
  exports: [UtilsService, RedisService]
})
export class CommonModule {}
