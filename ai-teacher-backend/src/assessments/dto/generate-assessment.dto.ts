import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';

export class GenerateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsOptional()
  @IsString()
  @IsIn(['easy', 'medium', 'hard', 'adaptive'])
  difficulty?: string = 'medium';

  @IsOptional()
  @IsNumber()
  questionCount?: number = 15;

  @IsOptional()
  @IsString()
  focusArea?: string;

  @IsOptional()
  @IsString()
  assessmentType?: string = 'diagnostic';
}