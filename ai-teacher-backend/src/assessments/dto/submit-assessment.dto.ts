// src/assessments/dto/submit-assessment.dto.ts
import { IsNumber, IsArray, ValidateNested, IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsNumber()
  selectedAnswer: number;

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high'])
  confidence?: 'low' | 'medium' | 'high';

  @IsOptional()
  flagged?: boolean;
}

export class SubmitAssessmentDto {
  @IsNumber()
  assessmentId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @IsOptional()
  @IsNumber()
  totalTimeSpent?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}