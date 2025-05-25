import { AssessmentQuestion, AssessmentAnswer } from '../types/assessment.types';

export class AssessmentUtils {
  static calculateScore(questions: AssessmentQuestion[], answers: AssessmentAnswer[]): number {
    if (questions.length === 0) return 0;
    
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / questions.length) * 100);
  }

  static calculateTopicScores(
    questions: AssessmentQuestion[],
    answers: AssessmentAnswer[],
  ): { [topic: string]: number } {
    const topicScores: { [topic: string]: { correct: number; total: number } } = {};
    
    questions.forEach((question, index) => {
      const topic = question.topic;
      const answer = answers[index];
      
      if (!topicScores[topic]) {
        topicScores[topic] = { correct: 0, total: 0 };
      }
      
      topicScores[topic].total++;
      if (answer?.isCorrect) {
        topicScores[topic].correct++;
      }
    });
    
    const result: { [topic: string]: number } = {};
    Object.keys(topicScores).forEach(topic => {
      const { correct, total } = topicScores[topic];
      result[topic] = total > 0 ? Math.round((correct / total) * 100) : 0;
    });
    
    return result;
  }

  static identifyWeakAreas(topicScores: { [topic: string]: number }): string[] {
    return Object.entries(topicScores)
      .filter(([_, score]) => score < 60)
      .map(([topic]) => topic)
      .sort((a, b) => topicScores[a] - topicScores[b]);
  }

  static identifyStrongAreas(topicScores: { [topic: string]: number }): string[] {
    return Object.entries(topicScores)
      .filter(([_, score]) => score >= 80)
      .map(([topic]) => topic)
      .sort((a, b) => topicScores[b] - topicScores[a]);
  }

  static determineRecommendedPace(
    averageTimePerQuestion: number,
    accuracy: number,
  ): 'slow' | 'normal' | 'fast' {
    if (averageTimePerQuestion > 180000 && accuracy < 70) return 'slow'; // > 3 minutes and low accuracy
    if (averageTimePerQuestion < 60000 && accuracy > 85) return 'fast'; // < 1 minute and high accuracy
    return 'normal';
  }

  static generateLearningStyleRecommendation(
    questionTypes: string[],
    timeSpentPerType: { [type: string]: number },
    accuracyPerType: { [type: string]: number },
  ): 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed' {
    // Analyze performance patterns to suggest learning style
    const styleScores = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      reading: 0,
    };

    // Visual learners typically perform better with charts, diagrams, multiple choice
    if (accuracyPerType['multiple_choice'] > 80) styleScores.visual += 2;
    if (accuracyPerType['matching'] > 75) styleScores.visual += 1;

    // Auditory learners may take more time but have good comprehension
    if (timeSpentPerType['short_answer'] > 120000 && accuracyPerType['short_answer'] > 70) {
      styleScores.auditory += 2;
    }

    // Kinesthetic learners prefer interactive, hands-on questions
    if (accuracyPerType['ordering'] > 75) styleScores.kinesthetic += 1;
    if (accuracyPerType['matching'] > 80) styleScores.kinesthetic += 1;

    // Reading learners excel with text-based questions
    if (accuracyPerType['fill_in_blank'] > 80) styleScores.reading += 2;
    if (accuracyPerType['short_answer'] > 85) styleScores.reading += 1;

    const maxScore = Math.max(...Object.values(styleScores));
    if (maxScore === 0) return 'mixed';

    const dominantStyles = Object.entries(styleScores)
      .filter(([_, score]) => score === maxScore)
      .map(([style]) => style);

    return dominantStyles.length === 1 ? dominantStyles[0] as any : 'mixed';
  }

  static formatTimeSpent(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  static getPerformanceLevel(score: number): 'excellent' | 'good' | 'fair' | 'needs_improvement' {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    return 'needs_improvement';
  }

  static generateStudyPlan(
    weakAreas: string[],
    strongAreas: string[],
    learningStyle: string,
  ): string[] {
    const plan: string[] = [];

    if (weakAreas.length > 0) {
      plan.push(`Priority: Focus on ${weakAreas.slice(0, 2).join(' and ')}`);
    }

    if (strongAreas.length > 0) {
      plan.push(`Build on strengths in ${strongAreas.slice(0, 2).join(' and ')}`);
    }

    const styleRecommendations = {
      visual: [
        'Use mind maps and diagrams for complex concepts',
        'Watch educational videos and tutorials',
        'Create flashcards with visual elements',
      ],
      auditory: [
        'Listen to educational podcasts',
        'Discuss concepts with study groups',
        'Read materials aloud while studying',
      ],
      kinesthetic: [
        'Use hands-on practice exercises',
        'Take frequent breaks during study sessions',
        'Use physical objects to represent abstract concepts',
      ],
      reading: [
        'Take detailed notes while reading',
        'Create written summaries of key concepts',
        'Use textbooks and written materials as primary resources',
      ],
      mixed: [
        'Use a variety of learning methods',
        'Alternate between visual, auditory, and hands-on approaches',
        'Find the combination that works best for each topic',
      ],
    };

    plan.push(...(styleRecommendations[learningStyle] || styleRecommendations.mixed));

    return plan;
  }
}
