// src/events/events.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const savedEvent = await this.eventsRepository.save(event);
    await this.invalidateCache();
    return savedEvent;
  }

  // NOTE: Since the end of the event is not specified, the event is considered to be 1 hour long. and 20 minutes before the event starts, the event is considered to be started.
  private async checkEventOverlap(eventDate: Date): Promise<void> {
    console.log({ eventDate });
    const overlappingEvents = await this.eventsRepository.find({
      where: {
        date: new Date(eventDate?.toISOString()?.split('T')?.[0]),
      },
    });

    if (overlappingEvents.length > 0) {
      throw new HttpException(
        'An event already exists in this time slot.',
        HttpStatus.CONFLICT,
      );
    }
  }

  private generateCacheKey(id: string): string {
    return `events:${id}`;
  }

  private async invalidateCache(id?: string): Promise<void> {
    if (id) {
      await this.cacheManager.del(`events:${id}`);
    } else {
      await this.cacheManager.del(`events`);
    }
  }

  async findAll(date?: Date, search?: string): Promise<Event[]> {
    // const cacheKey = this.generateCacheKey(date, search);

    if (!date && !search) {
      const cachedEvents = await this.cacheManager.get<Event[]>(`events`);
      if (cachedEvents) {
        return cachedEvents;
      }
    } else {
      const cacheKey = `events:filtered:${date ? date?.toISOString()?.split('T')?.[0] : ''}:${search || ''}`;

      const cachedEvents = await this.cacheManager.get<Event[]>(cacheKey);
      if (cachedEvents) {
        return cachedEvents;
      }
    }

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

    const events = await this.eventsRepository.find({
      where,
      order,
    });

    events.forEach((event) => {
      this.cacheManager.set(this.generateCacheKey(event.id), event, {
        ttl: 3600,
      } as any);
    });

    return events;
  }

  async findOne(id: string): Promise<Event> {
    const cacheKey = `events:${id}`;

    // Try to get from cache
    const cachedEvent = await this.cacheManager.get<Event>(cacheKey);
    if (cachedEvent) {
      return cachedEvent;
    }

    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['registrations', 'registrations.attendee'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    await this.cacheManager.set(cacheKey, event, { ttl: 3600 } as any);
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
      console.log(
        newDate?.toISOString()?.split('T')?.[0],
        event.date.toString(),
      );
      if (newDate?.toISOString()?.split('T')?.[0] !== event.date.toString()) {
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
    const updatedEvent = await this.eventsRepository.save(event);
    await this.invalidateCache(id);
    return updatedEvent;
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

  async delete(id: string): Promise<Event> {
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

    const deletedEvent = await this.eventsRepository.remove(event);
    await this.invalidateCache(deletedEvent.id);
    return deletedEvent;
  }
}
