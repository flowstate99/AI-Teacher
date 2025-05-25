// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // Allow extra properties
    transform: true,
    transformOptions: {
      enableImplicitConversion: true, // Auto-convert types
    },
    disableErrorMessages: false,
    validationError: {
      target: false,
      value: false,
    },
  }));
  
  await app.listen(3000);
  console.log('AI Teacher Backend running on http://localhost:3000');
}
bootstrap();