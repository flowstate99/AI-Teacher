import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsNumber, IsArray } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @IsBoolean()
  completed: boolean;

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsArray()
  exerciseResults?: {
    exerciseId: string;
    answer: any;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}