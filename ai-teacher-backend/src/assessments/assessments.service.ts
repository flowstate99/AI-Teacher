import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from './assessment.entity';
import { GeminiService } from '../gemini/gemini.service';
import { UsersService } from '../users/users.service';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { GenerateAssessmentDto } from './dto/generate-assessment.dto';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    private geminiService: GeminiService,
    private usersService: UsersService,
  ) {}

  async generateAssessment(
    generateDto: GenerateAssessmentDto,
    userId: number,
  ): Promise<{
    questions: any[];
    assessmentId: string;
    timeLimit: number;
    instructions: string;
  }> {
    try {
      const user = await this.usersService.findOne(userId);
      
      // Get user's learning profile for adaptive difficulty
      const userLevel = user.learningProfile?.pace || 'normal';
      const adjustedDifficulty = this.adjustDifficultyForUser(generateDto.difficulty || 'medium', userLevel);
      
      const generatedData = await this.geminiService.generateAssessment(
        generateDto.subject,
        adjustedDifficulty,
      );

      // Create assessment record (without answers and analysis initially)
      const assessment = this.assessmentRepository.create({
        subject: generateDto.subject,
        questions: generatedData.questions,
        user: { id: userId },
        answers: [], // Empty array initially
        // Don't set analysis - let it default to null/undefined
      });

      const savedAssessment = await this.assessmentRepository.save(assessment);

      // Return questions without correct answers for security
      const questionsForUser = generatedData.questions.map(q => ({
        ...q,
        correctAnswer: undefined, // Hide correct answer from client
      }));

      return {
        questions: questionsForUser,
        assessmentId: savedAssessment.id.toString(),
        timeLimit: this.calculateTimeLimit(generatedData.questions.length),
        instructions: this.getInstructions(generateDto.subject),
      };
    } catch (error) {
      console.error('Error in generateAssessment:', error);
      throw new BadRequestException(`Failed to generate assessment: ${error.message}`);
    }
  }

  async submitAssessment(
    submitDto: SubmitAssessmentDto,
    userId: number,
  ): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id: submitDto.assessmentId, user: { id: userId } },
      relations: ['user'],
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (assessment.analysis) {
      throw new BadRequestException('Assessment already submitted');
    }

    try {
      // Process answers and calculate scores
      const processedAnswers = this.processAnswers(assessment.questions, submitDto.answers);
      
      // Generate analysis using Gemini AI
      const analysis = await this.geminiService.analyzeAssessmentResults(
        { questions: assessment.questions },
        processedAnswers,
      );

      // Update assessment with answers and analysis
      assessment.answers = processedAnswers;
      assessment.analysis = {
        ...analysis,
        submittedAt: new Date(),
        timeSpent: submitDto.totalTimeSpent || 0,
      };

      const savedAssessment = await this.assessmentRepository.save(assessment);

      // Update user learning profile based on analysis
      await this.updateUserLearningProfile(userId, analysis);

      return savedAssessment;
    } catch (error) {
      throw new BadRequestException(`Failed to submit assessment: ${error.message}`);
    }
  }

  async findAll(userId: number): Promise<Assessment[]> {
    return await this.assessmentRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'subject',
        'createdAt',
        'analysis',
      ],
    });
  }

  async findOne(id: number, userId: number): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    return assessment;
  }

  async getAssessmentResults(id: number, userId: number): Promise<{
    assessment: Assessment;
    detailedAnalysis: any;
    recommendations: string[];
    nextSteps: string[];
  }> {
    const assessment = await this.findOne(id, userId);

    if (!assessment.analysis) {
      throw new BadRequestException('Assessment not yet submitted');
    }

    // Generate detailed analysis and recommendations
    const detailedAnalysis = await this.generateDetailedAnalysis(assessment);
    const recommendations = await this.generateRecommendations(assessment, userId);
    const nextSteps = await this.generateNextSteps(assessment, userId);

    return {
      assessment,
      detailedAnalysis,
      recommendations,
      nextSteps,
    };
  }

  async getAssessmentStats(userId: number): Promise<{
    totalAssessments: number;
    averageScore: number;
    subjectBreakdown: { [subject: string]: { count: number; averageScore: number } };
    improvementTrend: { date: Date; score: number; subject: string }[];
    strongestSubjects: string[];
    weakestSubjects: string[];
    recentPerformance: any[];
  }> {
    const assessments = await this.assessmentRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    const totalAssessments = assessments.length;
    const completedAssessments = assessments.filter(a => a.analysis);

    const averageScore = completedAssessments.length > 0
      ? completedAssessments.reduce((sum, a) => sum + (a.analysis?.overallScore || 0), 0) / completedAssessments.length
      : 0;

    // Subject breakdown
    const subjectBreakdown: { [subject: string]: { count: number; averageScore: number } } = {};
    completedAssessments.forEach(assessment => {
      if (!subjectBreakdown[assessment.subject]) {
        subjectBreakdown[assessment.subject] = { count: 0, averageScore: 0 };
      }
      subjectBreakdown[assessment.subject].count++;
      subjectBreakdown[assessment.subject].averageScore += assessment.analysis?.overallScore || 0;
    });

    // Calculate averages
    Object.keys(subjectBreakdown).forEach(subject => {
      subjectBreakdown[subject].averageScore /= subjectBreakdown[subject].count;
    });

    // Improvement trend
    const improvementTrend = completedAssessments.map(a => ({
      date: a.createdAt,
      score: a.analysis?.overallScore || 0,
      subject: a.subject,
    })).reverse();

    // Strongest and weakest subjects
    const subjectScores = Object.entries(subjectBreakdown)
      .map(([subject, data]) => ({ subject, score: data.averageScore }))
      .sort((a, b) => b.score - a.score);

    const strongestSubjects = subjectScores.slice(0, 3).map(s => s.subject);
    const weakestSubjects = subjectScores.slice(-3).map(s => s.subject).reverse();

    // Recent performance (last 5 assessments)
    const recentPerformance = completedAssessments.slice(0, 5).map(a => ({
      id: a.id,
      subject: a.subject,
      score: a.analysis?.overallScore || 0,
      date: a.createdAt,
      weakAreas: a.analysis?.weakAreas || [],
      strongAreas: a.analysis?.strongAreas || [],
    }));

    return {
      totalAssessments,
      averageScore: Math.round(averageScore),
      subjectBreakdown,
      improvementTrend,
      strongestSubjects,
      weakestSubjects,
      recentPerformance,
    };
  }

  async retakeAssessment(originalId: number, userId: number): Promise<{
    questions: any[];
    assessmentId: string;
    timeLimit: number;
    instructions: string;
  }> {
    const originalAssessment = await this.findOne(originalId, userId);
    
    // Generate new assessment with similar parameters but different questions
    return await this.generateAssessment({
      subject: originalAssessment.subject,
      difficulty: 'adaptive', // Use adaptive difficulty based on previous performance
      questionCount: originalAssessment.questions.length,
    }, userId);
  }

  async compareAssessments(id1: number, id2: number, userId: number): Promise<{
    comparison: any;
    improvements: string[];
    regressions: string[];
    recommendations: string[];
  }> {
    const [assessment1, assessment2] = await Promise.all([
      this.findOne(id1, userId),
      this.findOne(id2, userId),
    ]);

    if (!assessment1.analysis || !assessment2.analysis) {
      throw new BadRequestException('Both assessments must be completed for comparison');
    }

    const scoreImprovement = assessment2.analysis.overallScore - assessment1.analysis.overallScore;
    
    const improvements: string[] = [];
    const regressions: string[] = [];

    // Compare topic scores
    const topics1 = assessment1.analysis.topicScores || {};
    const topics2 = assessment2.analysis.topicScores || {};

    Object.keys(topics2).forEach(topic => {
      if (topics1[topic]) {
        const improvement = topics2[topic] - topics1[topic];
        if (improvement > 10) {
          improvements.push(`${topic}: +${improvement.toFixed(1)}% improvement`);
        } else if (improvement < -10) {
          regressions.push(`${topic}: ${improvement.toFixed(1)}% decline`);
        }
      }
    });

    const recommendations = await this.generateComparisonRecommendations(
      assessment1,
      assessment2,
      scoreImprovement,
    );

    return {
      comparison: {
        overallScoreChange: scoreImprovement,
        assessment1Score: assessment1.analysis.overallScore,
        assessment2Score: assessment2.analysis.overallScore,
        timeComparison: {
          assessment1Time: assessment1.analysis.timeSpent || 0,
          assessment2Time: assessment2.analysis.timeSpent || 0,
        },
      },
      improvements,
      regressions,
      recommendations,
    };
  }

  // Private helper methods
  private adjustDifficultyForUser(requestedDifficulty: string, userPace: string): string {
    const difficultyMap = {
      slow: { easy: 'easy', medium: 'easy', hard: 'medium', expert: 'hard' },
      normal: { easy: 'easy', medium: 'medium', hard: 'hard', expert: 'expert' },
      fast: { easy: 'medium', medium: 'hard', hard: 'expert', expert: 'expert' },
    };

    return difficultyMap[userPace]?.[requestedDifficulty] || requestedDifficulty;
  }

  private calculateTimeLimit(questionCount: number): number {
    // Base time: 2 minutes per question, minimum 10 minutes
    return Math.max(questionCount * 2, 10) * 60 * 1000; // Convert to milliseconds
  }

  private getInstructions(subject: string): string {
    const baseInstructions = `
      • Read each question carefully before answering
      • You can review and change your answers before submitting
      • There's no penalty for guessing, so answer all questions
      • Your performance will help personalize your learning experience
    `;

    const subjectSpecific = {
      'Mathematics': '• Show your work mentally and double-check calculations',
      'Science': '• Consider real-world applications of concepts',
      'Programming': '• Think through the logic step by step',
      'Languages': '• Context is important for correct answers',
    };

    return baseInstructions + (subjectSpecific[subject] || '');
  }

  private processAnswers(questions: any[], userAnswers: any[]): any[] {
    return userAnswers.map((answer, index) => {
      const question = questions[index];
      const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
      
      return {
        questionId: question?.id || `q_${index}`,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0,
        confidence: answer.confidence || 'medium',
      };
    });
  }

  private async updateUserLearningProfile(userId: number, analysis: any): Promise<void> {
    await this.usersService.updateLearningProfile(userId, {
      strengths: analysis.strongAreas || [],
      weaknesses: analysis.weakAreas || [],
      preferredStyle: analysis.learningStyle || 'mixed',
      pace: analysis.suggestedPace || 'normal',
    });
  }

  private async generateDetailedAnalysis(assessment: Assessment): Promise<any> {
    const { questions, answers, analysis } = assessment;
    
    if (!analysis) {
      throw new BadRequestException('Assessment analysis not available');
    }
    
    return {
      questionAnalysis: questions.map((q, index) => {
        const answer = answers[index];
        return {
          question: q.question,
          topic: q.topic,
          difficulty: q.difficulty,
          userAnswer: answer?.selectedAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: answer?.isCorrect || false,
          timeSpent: answer?.timeSpent || 0,
          explanation: (q as any).explanation || 'No explanation available',
        };
      }),
      topicMastery: analysis.topicScores,
      timeEfficiency: this.calculateTimeEfficiency(questions, answers),
      difficultyPerformance: this.analyzeDifficultyPerformance(questions, answers),
    };
  }

  private async generateRecommendations(assessment: Assessment, userId: number): Promise<string[]> {
    const recommendations: string[] = [];
    const analysis = assessment.analysis;
    
    if (!analysis) {
      return ['Complete the assessment to get personalized recommendations'];
    }
    
    if (analysis.weakAreas && analysis.weakAreas.length > 0) {
      recommendations.push(
        `Focus on improving ${analysis.weakAreas.slice(0, 2).join(' and ')}`
      );
    }
    
    if (analysis.overallScore < 60) {
      recommendations.push('Consider reviewing fundamentals before advancing');
    } else if (analysis.overallScore > 85) {
      recommendations.push('Ready for advanced topics in this subject');
    }
    
    if (analysis.learningStyle) {
      const styleRecommendations = {
        visual: 'Use diagrams, charts, and visual aids in your studies',
        auditory: 'Try listening to educational podcasts or discussing topics aloud',
        kinesthetic: 'Engage with hands-on activities and practical exercises',
        reading: 'Focus on reading comprehensive materials and taking detailed notes',
      };
      
      recommendations.push(styleRecommendations[analysis.learningStyle]);
    }
    
    return recommendations;
  }

  private async generateNextSteps(assessment: Assessment, userId: number): Promise<string[]> {
    const nextSteps: string[] = [];
    const analysis = assessment.analysis;
    
    if (!analysis) {
      return ['Complete the assessment to get personalized next steps'];
    }
    
    nextSteps.push('Generate a personalized course targeting your weak areas');
    
    if (analysis.overallScore < 70) {
      nextSteps.push('Take additional practice assessments in this subject');
    }
    
    nextSteps.push('Review detailed analysis to understand specific areas for improvement');
    nextSteps.push('Set learning goals based on assessment results');
    
    return nextSteps;
  }

  private async generateComparisonRecommendations(
    assessment1: Assessment,
    assessment2: Assessment,
    scoreImprovement: number,
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (scoreImprovement > 0) {
      recommendations.push('Great progress! Continue with your current study approach');
    } else if (scoreImprovement < -5) {
      recommendations.push('Consider adjusting your study strategy or seeking additional help');
    }
    
    if (scoreImprovement > 15) {
      recommendations.push('Excellent improvement! You may be ready for more advanced material');
    }
    
    return recommendations;
  }

  private calculateTimeEfficiency(questions: any[], answers: any[]): any {
    const totalTime = answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
    const averageTimePerQuestion = totalTime / questions.length;
    
    return {
      totalTime,
      averageTimePerQuestion,
      efficiency: averageTimePerQuestion < 120000 ? 'high' : 'normal', // Less than 2 minutes per question
    };
  }

  private analyzeDifficultyPerformance(questions: any[], answers: any[]): any {
    const performance = { easy: 0, medium: 0, hard: 0 };
    const counts = { easy: 0, medium: 0, hard: 0 };
    
    questions.forEach((q, index) => {
      const difficulty = q.difficulty;
      const isCorrect = answers[index]?.isCorrect || false;
      
      if (performance.hasOwnProperty(difficulty)) {
        performance[difficulty] += isCorrect ? 1 : 0;
        counts[difficulty]++;
      }
    });
    
    // Calculate percentages
    Object.keys(performance).forEach(difficulty => {
      if (counts[difficulty] > 0) {
        performance[difficulty] = (performance[difficulty] / counts[difficulty]) * 100;
      }
    });
    
    return performance;
  }
}