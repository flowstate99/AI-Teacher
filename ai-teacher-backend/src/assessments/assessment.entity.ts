import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject: string;

  @Column({ type: 'json' })
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    topic: string;
    difficulty: string;
  }[];

  @Column({ type: 'json' })
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];

  @Column({ type: 'json' })
  analysis: {
    overallScore: number;
    topicScores: { [topic: string]: number };
    weakAreas: string[];
    strongAreas: string[];
    recommendations: string[];
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    timeSpent?: number;
  };

  @ManyToOne(() => User, user => user.assessments)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}