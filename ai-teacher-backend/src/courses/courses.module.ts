import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './course.entity';
import { GeminiModule } from '../gemini/gemini.module';
import { UsersModule } from '../users/users.module';
import { Assessment } from 'src/assessments/assessment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Assessment]),
    GeminiModule,
    UsersModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}