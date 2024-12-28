import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { EventsModule } from './modules/events/events.module';
import { AttendeesModule } from './modules/attendees/attendees.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      cache: true,
    }),
    ThrottlerModule.forRootAsync({
      useFactory: async () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.RATE_LIMITER_TIME_TO_LEAVE, 10) || 60000, // default to 60000 if env variable not present
            limit: parseInt(process.env.RATE_LIMITER_MAX_TRY, 10) || 2, // default to 2 if env variable not present
          },
        ],
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    EventsModule,
    AttendeesModule,
    RegistrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [TypeOrmModule],
})
export class AppModule {}
