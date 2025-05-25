// src/assessments/assessments.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { GenerateAssessmentDto } from './dto/generate-assessment.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('assessments')
@UseGuards(JwtAuthGuard)
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post('generate')
  generateAssessment(
    @Body() generateDto: GenerateAssessmentDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.assessmentsService.generateAssessment(generateDto, userId);
  }

  @Post('debug-submit')
  debugSubmit(@Body() body: any, @CurrentUser('userId') userId: number) {
    console.log('=== Debug Submit Endpoint ===');
    console.log('Raw body:', JSON.stringify(body, null, 2));
    console.log('User ID:', userId);
    console.log('Body type:', typeof body);
    console.log('AssessmentId:', body.assessmentId);
    console.log('AssessmentId type:', typeof body.assessmentId);
    console.log('Answers type:', typeof body.answers);
    console.log('Answers is array:', Array.isArray(body.answers));
    
    if (body.answers && Array.isArray(body.answers)) {
      console.log('Answers length:', body.answers.length);
      console.log('First answer:', body.answers[0]);
      if (body.answers[0]) {
        console.log('First answer selectedAnswer:', body.answers[0].selectedAnswer);
        console.log('First answer selectedAnswer type:', typeof body.answers[0].selectedAnswer);
      }
    }
    
    return {
      message: 'Debug info logged to console',
      receivedData: {
        assessmentId: body.assessmentId,
        assessmentIdType: typeof body.assessmentId,
        answersLength: body.answers?.length,
        answersType: typeof body.answers,
        isArray: Array.isArray(body.answers),
        firstAnswer: body.answers?.[0],
      }
    };
  }

  @Post('submit')
  async submitAssessment(
    @Body() submitDto: SubmitAssessmentDto,
    @CurrentUser('userId') userId: number,
  ) {
    console.log('=== Submit Assessment Controller ===');
    console.log('Received DTO:', submitDto);
    console.log('Assessment ID:', submitDto.assessmentId);
    console.log('Assessment ID type:', typeof submitDto.assessmentId);
    console.log('Answers array length:', submitDto.answers?.length);
    console.log('User ID:', userId);
    
    return this.assessmentsService.submitAssessment(submitDto, userId);
  }

  @Post(':id/retake')
  retakeAssessment(
    @Param('id') id: string,
    @CurrentUser('userId') userId: number,
  ) {
    return this.assessmentsService.retakeAssessment(+id, userId);
  }

  @Get()
  findAll(@CurrentUser('userId') userId: number) {
    return this.assessmentsService.findAll(userId);
  }

  @Get('stats')
  getAssessmentStats(@CurrentUser('userId') userId: number) {
    return this.assessmentsService.getAssessmentStats(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: number) {
    return this.assessmentsService.findOne(+id, userId);
  }

  @Get(':id/results')
  getAssessmentResults(
    @Param('id') id: string,
    @CurrentUser('userId') userId: number,
  ) {
    return this.assessmentsService.getAssessmentResults(+id, userId);
  }

  @Get(':id1/compare/:id2')
  compareAssessments(
    @Param('id1') id1: string,
    @Param('id2') id2: string,
    @CurrentUser('userId') userId: number,
  ) {
    return this.assessmentsService.compareAssessments(+id1, +id2, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssessmentDto: UpdateAssessmentDto,
    @CurrentUser('userId') userId: number,
  ) {
    throw new BadRequestException('Assessments cannot be modified after creation');
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: number) {
    throw new BadRequestException('Assessments cannot be deleted to maintain learning history');
  }
}