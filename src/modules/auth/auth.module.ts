import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './auth.controller';
import { jwtConfig } from 'src/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginLog } from './entities/login-log.entity';
import { JwtService } from './service/jwt.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { Attendee } from '../attendees/entities/attendee.entity';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig),
    TypeOrmModule.forFeature([Attendee, LoginLog]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy, ConfigService],
  exports: [AuthService],
})
export class AuthModule {}
