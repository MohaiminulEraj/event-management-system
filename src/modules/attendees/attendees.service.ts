import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { Attendee } from './entities/attendee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
  ) {}

  async create(createAttendeeDto: CreateAttendeeDto) {
    const checkAttendee = await this.attendeeRepository.findOne({
      where: { email: createAttendeeDto.email },
    });

    if (checkAttendee) {
      throw new HttpException(
        'Attendee already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    const attendee = this.attendeeRepository.create(createAttendeeDto);
    return await this.attendeeRepository.save(attendee);
  }

  async findAll(): Promise<Attendee[]> {
    return await this.attendeeRepository.find();
  }

  async findOne(id: string) {
    const attendee = await this.attendeeRepository.findOne({
      where: { id },
      relations: ['registrations', 'registrations.event'],
    });
    if (!attendee) {
      throw new HttpException('Attendee not found', HttpStatus.NOT_FOUND);
    }
    return attendee;
  }

  async searchAttendees(query: string): Promise<Attendee[]> {
    return await this.attendeeRepository.find({
      where: [{ name: ILike(`%${query}%`) }, { email: ILike(`%${query}%`) }],
    });
  }

  async getAttendeesWithMultipleRegistrations(): Promise<any[]> {
    try {
      const result = await this.attendeeRepository.query(`
      SELECT 
          a.id,
          a.name,
          a.email,
          COUNT(DISTINCT r."eventId") AS event_count
      FROM 
          attendee a
      JOIN 
          registration r ON a.id = r."attendeeId"
      GROUP BY 
          a.id
      HAVING 
          COUNT(DISTINCT r."eventId") > 1;
    `);
      return result;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string) {
    const attendee = await this.findOne(id);
    if (!attendee) {
      throw new HttpException('Attendee not found', HttpStatus.NOT_FOUND);
    }
    return await this.attendeeRepository.remove(attendee);
  }
}
