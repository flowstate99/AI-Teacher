import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AssessmentSecurityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Remove sensitive information from assessment data before sending to client
        if (data && data.questions) {
          data.questions = data.questions.map(question => ({
            ...question,
            correctAnswer: undefined, // Never send correct answers to client
            explanation: undefined, // Send explanations only after submission
          }));
        }
        return data;
      }),
    );
  }
}
