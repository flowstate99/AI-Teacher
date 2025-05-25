import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { SubmitAssessmentDto } from '../dto/submit-assessment.dto';

@Injectable()
export class AssessmentValidationPipe implements PipeTransform {
  transform(value: SubmitAssessmentDto): SubmitAssessmentDto {
    // Validate that all required answers are provided
    if (!value.answers || value.answers.length === 0) {
      throw new BadRequestException('Assessment answers are required');
    }

    // Validate answer format
    value.answers.forEach((answer, index) => {
      if (typeof answer.selectedAnswer !== 'number') {
        throw new BadRequestException(`Invalid answer format at question ${index + 1}`);
      }
    });

    // Validate time spent is reasonable (not negative, not impossibly fast)
    if (value.totalTimeSpent && value.totalTimeSpent < 0) {
      throw new BadRequestException('Invalid time spent');
    }

    return value;
  }
}