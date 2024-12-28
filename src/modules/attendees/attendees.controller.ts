import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Attendee } from './entities/attendee.entity';

@ApiTags('🌏 Attendee API')
@Controller('attendees')
@UseGuards(ThrottlerGuard)
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Post()
  @ApiOperation({ summary: 'Creating a Attendee' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Attendee created successfully',
    status: HttpStatus.CREATED,
  })
  async create(@Body() createAttendeeDto: CreateAttendeeDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Attendee created successfully',
      result: await this.attendeesService.create(createAttendeeDto),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Getting all Attendee' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Data retrieved successfully',
    status: HttpStatus.OK,
  })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query('search') search?: string) {
    if (search) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Data retrieved successfully',
        result: await this.attendeesService.searchAttendees(search),
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Data retrieved successfully',
      result: await this.attendeesService.findAll(),
    };
  }

  @Get('multiple-registrations')
  @ApiOperation({
    summary: 'Getting all Attendees who have registered for multiple events',
  })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Data retrieved successfully',
    status: HttpStatus.OK,
  })
  async getAttendeesWithMultipleRegistrations() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Data retrieved successfully',
      result:
        await this.attendeesService.getAttendeesWithMultipleRegistrations(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Getting an Attendee' })
  @ApiResponse({
    description: 'Attendee Not Found',
    status: HttpStatus.NOT_FOUND,
  })
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
      result: await this.attendeesService.findOne(id),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleting an Attendee' })
  @ApiResponse({
    description: 'Attendee Not Found',
    status: HttpStatus.NOT_FOUND,
  })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Data Found',
    status: HttpStatus.OK,
  })
  async delete(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Data Found',
      result: await this.attendeesService.delete(id),
    };
  }
}
