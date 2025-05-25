import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from '../assessment.entity';
import { AssessmentUtils } from '../utils/assessment.utils';

@Injectable()
export class AssessmentAnalyticsService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
  ) {}

  async generateLearningInsights(userId: number): Promise<{
    learningVelocity: number;
    consistencyScore: number;
    masteryProgression: { [subject: string]: number[] };
    predictedPerformance: { [subject: string]: number };
    optimizationSuggestions: string[];
  }> {
    const assessments = await this.assessmentRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    });

    const completedAssessments = assessments.filter(a => a.analysis);

    if (completedAssessments.length < 2) {
      return {
        learningVelocity: 0,
        consistencyScore: 0,
        masteryProgression: {},
        predictedPerformance: {},
        optimizationSuggestions: ['Complete more assessments to generate learning insights'],
      };
    }

    const learningVelocity = this.calculateLearningVelocity(completedAssessments);
    const consistencyScore = this.calculateConsistencyScore(completedAssessments);
    const masteryProgression = this.calculateMasteryProgression(completedAssessments);
    const predictedPerformance = this.predictFuturePerformance(completedAssessments);
    const optimizationSuggestions = this.generateOptimizationSuggestions(
      completedAssessments,
      learningVelocity,
      consistencyScore,
    );

    return {
      learningVelocity,
      consistencyScore,
      masteryProgression,
      predictedPerformance,
      optimizationSuggestions,
    };
  }

  private calculateLearningVelocity(assessments: Assessment[]): number {
    // Calculate the rate of improvement over time
    if (assessments.length < 3) return 0;

    const scores = assessments.map(a => a.analysis.overallScore);
    const timeSpans = assessments.slice(1).map((a, i) => 
      a.createdAt.getTime() - assessments[i].createdAt.getTime()
    );

    let totalImprovement = 0;
    let totalTime = 0;

    for (let i = 1; i < scores.length; i++) {
      const improvement = scores[i] - scores[i - 1];
      const timeSpan = timeSpans[i - 1];
      totalImprovement += improvement;
      totalTime += timeSpan;
    }

    // Return improvement per day
    return totalTime > 0 ? (totalImprovement / (totalTime / (24 * 60 * 60 * 1000))) : 0;
  }

  private calculateConsistencyScore(assessments: Assessment[]): number {
    const scores = assessments.map(a => a.analysis.overallScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Higher consistency = lower standard deviation
    // Normalize to 0-100 scale where 100 is perfectly consistent
    return Math.max(0, 100 - standardDeviation);
  }

  private calculateMasteryProgression(assessments: Assessment[]): { [subject: string]: number[] } {
    const progression: { [subject: string]: number[] } = {};

    assessments.forEach(assessment => {
      const subject = assessment.subject;
      const score = assessment.analysis.overallScore;

      if (!progression[subject]) {
        progression[subject] = [];
      }
      progression[subject].push(score);
    });

    return progression;
  }

  private predictFuturePerformance(assessments: Assessment[]): { [subject: string]: number } {
    const predictions: { [subject: string]: number } = {};
    const subjectData = this.calculateMasteryProgression(assessments);

    Object.entries(subjectData).forEach(([subject, scores]) => {
      if (scores.length >= 3) {
        // Simple linear regression for trend prediction
        const trend = this.calculateTrend(scores);
        const lastScore = scores[scores.length - 1];
        predictions[subject] = Math.min(100, Math.max(0, lastScore + trend));
      }
    });

    return predictions;
  }

  private calculateTrend(scores: number[]): number {
    const n = scores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = scores;

    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);

    return denominator !== 0 ? numerator / denominator : 0;
  }

  private generateOptimizationSuggestions(
    assessments: Assessment[],
    learningVelocity: number,
    consistencyScore: number,
  ): string[] {
    const suggestions: string[] = [];

    if (learningVelocity < 0) {
      suggestions.push('Your scores are declining. Consider reviewing fundamental concepts or adjusting your study approach.');
    } else if (learningVelocity > 2) {
      suggestions.push('Excellent progress! You might be ready for more challenging material.');
    }

    if (consistencyScore < 60) {
      suggestions.push('Your performance varies significantly. Try to establish a more consistent study routine.');
    }

    const recentAssessments = assessments.slice(-3);
    const recentAverage = recentAssessments.reduce((sum, a) => sum + a.analysis.overallScore, 0) / recentAssessments.length;

    if (recentAverage < 70) {
      suggestions.push('Consider focusing on fewer topics at a time to build stronger foundations.');
    }

    if (suggestions.length === 0) {
      suggestions.push('You\'re doing well! Continue with your current learning approach.');
    }

    return suggestions;
  }
}