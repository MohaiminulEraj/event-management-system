import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { Repository } from 'typeorm';
import { EventsService } from '../events/events.service';
import { AttendeesService } from '../attendees/attendees.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    private readonly eventService: EventsService,
    private readonly attendeeService: AttendeesService,
  ) {}
  async create(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<Registration> {
    const event = await this.eventService.findOne(
      createRegistrationDto.event_id,
    );

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    const attendee = await this.attendeeService.findOne(
      createRegistrationDto.attendee_id,
    );

    if (!attendee) {
      throw new BadRequestException('Attendee not found');
    }

    // Check if registration already exists
    const existingRegistration = await this.registrationRepository.findOne({
      where: {
        event: { id: event.id },
        attendee: { id: attendee.id },
      },
    });

    if (existingRegistration) {
      throw new ConflictException(
        'Attendee is already registered for this event',
      );
    }

    // Check if event is full
    const registrationCount = await this.registrationRepository.count({
      where: { event: { id: event.id } },
    });

    if (registrationCount >= event.max_attendees) {
      throw new BadRequestException('Event has reached maximum capacity');
    }

    // Create registration
    const registration = this.registrationRepository.create({
      event,
      attendee,
      registered_at: Date.now(),
    });

    return await this.registrationRepository.save(registration);
  }

  async findAllByEvent(event_id: string): Promise<Registration[]> {
    const event = await this.eventService.findOne(event_id);
    if (!event) {
      throw new BadRequestException('Event not found');
    }

    return await this.registrationRepository.find({
      where: { event: { id: event.id } },
      relations: ['event', 'attendee'],
    });
  }

  async remove(id: string) {
    const registration = await this.registrationRepository.findOne({
      where: { id },
    });
    if (!registration) {
      throw new BadRequestException('Registration not found');
    }
    return await this.registrationRepository.remove(registration);
  }
}
