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

  @Post('submit')
  submitAssessment(
    @Body() submitDto: SubmitAssessmentDto,
    @CurrentUser('userId') userId: number,
  ) {
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
    // Note: This might not be needed for assessments, as they shouldn't be editable after creation
    throw new BadRequestException('Assessments cannot be modified after creation');
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: number) {
    // Note: Consider if assessments should be deletable
    throw new BadRequestException('Assessments cannot be deleted to maintain learning history');
  }
}
