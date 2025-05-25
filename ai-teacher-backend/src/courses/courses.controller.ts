import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GeneratePersonalizedCourseDto } from './dto/generate-personalized-course.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser('userId') userId: number) {
    return this.coursesService.create(createCourseDto, userId);
  }

  @Post('personalized')
  generatePersonalizedCourse(
    @Body() generateDto: GeneratePersonalizedCourseDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.coursesService.generatePersonalizedCourse(generateDto, userId);
  }

  @Post('from-template')
  generateFromTemplate(
    @Body() body: { subject: string; template: string },
    @CurrentUser('userId') userId: number,
  ) {
    return this.coursesService.generateCourseFromTemplate(
      body.subject,
      body.template,
      userId,
    );
  }

  @Post(':id/duplicate')
  duplicateCourse(@Param('id') id: string, @CurrentUser('userId') userId: number) {
    return this.coursesService.duplicateCourse(+id, userId);
  }

  @Get()
  findAll(@CurrentUser('userId') userId: number, @Query('subject') subject?: string) {
    if (subject) {
      return this.coursesService.getCoursesBySubject(subject, userId);
    }
    return this.coursesService.findAll(userId);
  }

  @Get('recommended')
  getRecommendedCourses(@CurrentUser('userId') userId: number) {
    return this.coursesService.getRecommendedCourses(userId);
  }

  @Get('stats')
  getCourseStats(@CurrentUser('userId') userId: number) {
    return this.coursesService.getCourseStats(userId);
  }

  @Get('search')
  searchCourses(@Query('q') query: string, @CurrentUser('userId') userId: number) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    return this.coursesService.searchCourses(query, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: number) {
    return this.coursesService.findOne(+id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.coursesService.update(+id, updateCourseDto, userId);
  }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.coursesService.updateProgress(+id, updateProgressDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: number) {
    return this.coursesService.remove(+id, userId);
  }
}