export interface CourseModule {
  id: string;
  title: string;
  content: string;
  exercises: Exercise[];
  estimatedTime: number;
}

export interface Exercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'problem_solving' | 'drag_drop' | 'coding';
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hints?: string[];
}

export interface CourseProgress {
  completedModules: string[];
  currentModule: string;
  totalProgress: number;
  timeSpent?: number;
  lastAccessed?: Date;
}

export interface LearningObjective {
  id: string;
  description: string;
  achieved: boolean;
  moduleId: string;
}
