import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ExerciseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsOptional()
  correctAnswer?: any;

  @IsString()
  @IsNotEmpty()
  explanation: string;
}

class ModuleDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises: ExerciseDto[];

  @IsOptional()
  estimatedTime?: number;
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  difficulty: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleDto)
  modules: ModuleDto[];

  @IsOptional()
  @IsBoolean()
  isPersonalized?: boolean;

  @IsOptional()
  @IsArray()
  targetWeaknesses?: string[];
}