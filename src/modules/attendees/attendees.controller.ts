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
} from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { VerifiedUserGuard } from 'src/common/guards/verified-user.guard';
import { RequiredVerifications } from 'src/common/decorators/verifications.decorator';
import { RequiredVerificationsEnum } from '../auth/data/required-verifications.enum';

@ApiTags('🔒 Attendee API')
@UseGuards(ThrottlerGuard)
@Controller('attendees')
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @RequiredVerifications(RequiredVerificationsEnum.EMAIL)
  @ApiOperation({ summary: 'Creating a Attendee' })
  @ApiResponse({ description: 'Bad Request', status: HttpStatus.BAD_REQUEST })
  @ApiResponse({
    description: 'Something went wrong',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  })
  @ApiResponse({
    description: 'Lab added successfully',
    status: HttpStatus.CREATED,
  })
  create(@Body() createAttendeeDto: CreateAttendeeDto) {
    return this.attendeesService.create(createAttendeeDto);
  }

  @Get()
  findAll() {
    return this.attendeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendeesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttendeeDto: UpdateAttendeeDto,
  ) {
    return this.attendeesService.update(+id, updateAttendeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendeesService.remove(+id);
  }
}
