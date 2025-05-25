export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  timeLimit?: number;
  hints?: string[];
}

export interface AssessmentAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  confidence?: 'low' | 'medium' | 'high';
  flagged?: boolean;
}

export interface AssessmentAnalysis {
  overallScore: number;
  topicScores: { [topic: string]: number };
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  suggestedPace?: 'slow' | 'normal' | 'fast';
  timeSpent?: number;
  submittedAt?: Date;
}

export interface DetailedQuestionAnalysis {
  question: string;
  topic: string;
  difficulty: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  explanation: string;
}