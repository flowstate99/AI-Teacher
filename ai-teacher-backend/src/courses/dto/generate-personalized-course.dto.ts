// src/courses/dto/generate-personalized-course.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GeneratePersonalizedCourseDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsString()
  focusArea?: string;

  @IsOptional()
  @IsString()
  learningObjective?: string;
}