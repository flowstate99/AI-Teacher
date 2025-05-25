import { IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  selectedAnswer: number;

  @IsOptional()
  timeSpent?: number;

  @IsOptional()
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
  totalTimeSpent?: number;

  @IsOptional()
  feedback?: string;
}
