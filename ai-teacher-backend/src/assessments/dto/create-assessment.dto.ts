import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  options: string[];

  correctAnswer: number;

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsNotEmpty()
  difficulty: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  timeLimit?: number;
}