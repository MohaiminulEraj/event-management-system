import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { EventsModule } from '../events/events.module';
import { AttendeesModule } from '../attendees/attendees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Registration]),
    EventsModule,
    AttendeesModule,
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
})
export class RegistrationsModule {}
