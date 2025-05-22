import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly aiService: AiService) {}

  @Get('generate')
  async generate(
    @Query('topic') topic: string,
    @Query('level') level: 'beginner' | 'intermediate' | 'advanced',
  ) {
    return this.aiService.generateCourse(topic, level);
  }
}
