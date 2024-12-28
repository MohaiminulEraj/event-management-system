import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('🌏 Registration API')
@Controller('registrations')
@UseGuards(ThrottlerGuard)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new registration' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Registration created successfully',
    status: HttpStatus.CREATED,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The registration has been successfully created.',
  })
  async create(@Body() createRegistrationDto: CreateRegistrationDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Registration created successfully',
      result: await this.registrationsService.create(createRegistrationDto),
    };
  }

  @Get('event/:event_id')
  @ApiOperation({ summary: 'Get all registrations for an event' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Data Found',
    status: HttpStatus.OK,
  })
  async findAllByEvent(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Data Found',
      result: await this.registrationsService.findAllByEvent(id),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete registration by ID' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Data Found',
    status: HttpStatus.OK,
  })
  async remove(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Data Found',
      result: await this.registrationsService.remove(id),
    };
  }
}
