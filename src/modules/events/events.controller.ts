import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('🌏 Event API')
@Controller('events')
@UseGuards(ThrottlerGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Event' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Event created successfully',
    status: HttpStatus.CREATED,
  })
  async create(@Body() createEventDto: CreateEventDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Event created successfully',
      result: await this.eventsService.create(createEventDto),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all Events' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Data Found',
    status: HttpStatus.OK,
  })
  @ApiQuery({ name: 'date', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('date') date?: string,
    @Query('search') search?: string,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Data Found',
      result: await this.eventsService.findAll(date && new Date(date), search),
    };
  }

  @Get('most-registrations')
  @ApiOperation({ summary: 'Get Event with the most registration' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Data Found',
    status: HttpStatus.OK,
  })
  async getEventWithMostRegistrations() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Data Found',
      result: await this.eventsService.getEventWithMostRegistrations(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Event by ID' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Data Found',
    status: HttpStatus.OK,
  })
  async findOne(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Data Found',
      result: await this.eventsService.findOne(id),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Event by ID' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Event updated successfully',
    status: HttpStatus.OK,
  })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Event updated successfully',
      result: await this.eventsService.update(id, updateEventDto),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Event by ID' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Event deleted successfully',
    status: HttpStatus.OK,
  })
  async delete(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Event deleted successfully',
      result: await this.eventsService.delete(id),
    };
  }
}
