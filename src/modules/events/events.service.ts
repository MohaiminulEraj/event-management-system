// src/events/events.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  ILike,
} from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    if (createEventDto.max_attendees <= 0) {
      throw new HttpException(
        'Maximum attendees must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    const eventDate = new Date(createEventDto.date);
    if (eventDate < new Date()) {
      throw new HttpException(
        'Event date cannot be in the past',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.checkEventOverlap(eventDate);

    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  // NOTE: Since the end of the event is not specified, the event is considered to be 1 hour long. and 20 minutes before the event starts, the event is considered to be started.
  private async checkEventOverlap(eventDate: Date): Promise<void> {
    const startWindow = new Date(eventDate.getTime() - 20 * 60 * 1000); // 20 minutes before
    const endWindow = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hour after

    const overlappingEvents = await this.eventsRepository.find({
      where: {
        date: Between(startWindow, endWindow),
      },
    });

    if (overlappingEvents.length > 0) {
      throw new HttpException(
        'An event already exists in this time slot.',
        HttpStatus.CONFLICT,
      );
    }
  }

  async findAll(date?: Date, search?: string): Promise<Event[]> {
    const where: any = {};
    const order: any = { date: 'ASC' };
    if (date) {
      console.log(date);
      // Filter events by specific date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = Between(startOfDay, endOfDay);
    }

    if (search) {
      console.log(search);
      where.name = ILike(`%${search}%`);
    }

    return await this.eventsRepository.find({
      where,
      order,
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['registrations', 'registrations.attendee'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // If date is being updated, check for overlaps
    if (updateEventDto.date) {
      const newDate = new Date(updateEventDto.date);
      if (newDate.toString() !== event.date.toString()) {
        await this.checkEventOverlap(newDate);
      }
    }

    // If max_attendees is being updated, ensure it's not less than current registrations
    if (updateEventDto.max_attendees) {
      const currentRegistrations = event.registrations?.length || 0;
      if (updateEventDto.max_attendees < currentRegistrations) {
        throw new BadRequestException(
          `Cannot reduce maximum attendees below current registration count (${currentRegistrations})`,
        );
      }
    }

    Object.assign(event, updateEventDto);
    return await this.eventsRepository.save(event);
  }

  async getEventWithMostRegistrations(): Promise<any> {
    const result = await this.eventsRepository.query(`
      SELECT 
          e.id,
          e.name,
          e.date,
          COUNT(r.id) AS registration_count
      FROM 
          event e
      LEFT JOIN 
          registration r ON e.id = r."eventId"
      GROUP BY 
          e.id
      ORDER BY 
          registration_count DESC
      LIMIT 1;
    `);

    return result[0];
  }

  async delete(id: string): Promise<void> {
    const event = await this.findOne(id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Check if event has any registrations
    if (event.registrations?.length > 0) {
      throw new BadRequestException(
        'Cannot delete event with existing registrations. Cancel all registrations first.',
      );
    }

    await this.eventsRepository.remove(event);
  }
}
