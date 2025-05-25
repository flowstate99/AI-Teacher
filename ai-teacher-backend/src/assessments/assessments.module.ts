import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';
import { AssessmentAnalyticsService } from './services/assessment-analytics.service';
import { Assessment } from './assessment.entity';
import { GeminiModule } from '../gemini/gemini.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assessment]),
    GeminiModule,
    UsersModule,
  ],
  controllers: [AssessmentsController],
  providers: [
    AssessmentsService,
    AssessmentAnalyticsService,
  ],
  exports: [
    AssessmentsService,
    AssessmentAnalyticsService,
  ],
})
export class AssessmentsModule {}