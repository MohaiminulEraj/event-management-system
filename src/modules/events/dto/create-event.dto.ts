import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    type: 'string',
    description: 'Event Name',
    example: 'DevFest 2025',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Event Description',
    example: 'DevFest is a community-led developer event.',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    type: 'string',
    description: 'Event Date',
    example: '2025-01-01T09:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Event Location',
    example: 'Dhaka',
  })
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty({
    type: 'number',
    description: 'Maximum Attendees',
    example: 100,
  })
  @IsNotEmpty()
  max_attendees: number;
}
