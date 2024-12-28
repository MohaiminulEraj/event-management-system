import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAttendeeDto {
  @ApiProperty({
    type: 'string',
    description: 'Attendee Name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Attendee Password',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    type: 'string',
    description: 'Attendee Email',
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
