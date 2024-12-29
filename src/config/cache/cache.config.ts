import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as RedisStore from 'cache-manager-ioredis';
import { RedisOptions } from 'ioredis';

export const cacheConfig = (
  configService: ConfigService,
): CacheModuleOptions => ({
  store: RedisStore,
  host: configService.get<string>('REDIS_HOST', 'localhost'),
  port: configService.get<number>('REDIS_PORT', 6379),
  password: configService.get<string>('REDIS_PASSWORD', ''),
  ttl: configService.get<number>('CACHE_TTL', 3600), // 1 hour in seconds
});
