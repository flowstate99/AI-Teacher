import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AssessmentsService } from '../assessments.service';

@Injectable()
export class AssessmentOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private assessmentsService: AssessmentsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const assessmentId = request.params.id;

    if (!assessmentId || !user) {
      return false;
    }

    try {
      await this.assessmentsService.findOne(+assessmentId, user.userId);
      return true;
    } catch (error) {
      throw new ForbiddenException('You do not have access to this assessment');
    }
  }
}