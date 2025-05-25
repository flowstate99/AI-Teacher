// src/assessments/assessment.entity.ts
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
    explanation?: string;
  }[];

  @Column({ type: 'json', nullable: true, default: '[]' })
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
    confidence?: string;
    flagged?: boolean;
  }[];

  @Column({ type: 'json'})
  analysis: {
    overallScore: number;
    topicScores: { [topic: string]: number };
    weakAreas: string[];
    strongAreas: string[];
    recommendations: string[];
    learningStyle?: string;
    suggestedPace?: string;
    timeSpent?: number;
    submittedAt?: Date;
  };

  @ManyToOne(() => User, user => user.assessments)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}