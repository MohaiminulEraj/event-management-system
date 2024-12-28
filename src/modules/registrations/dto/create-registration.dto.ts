import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRegistrationDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'UUID of the event' })
  event_id: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'UUID of the attendee' })
  attendee_id: string;
}
