import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Event Management API')
  .setDescription('This is the collection of APIs.')
  .setVersion('0.0.1')
  .addBearerAuth()
  .build();
