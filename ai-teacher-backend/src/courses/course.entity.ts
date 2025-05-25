import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  subject: string;

  @Column()
  difficulty: string;

  @Column({ type: 'json' })
  modules: {
    id: string;
    title: string;
    content: string;
    exercises: {
      id: string;
      type: string;
      question: string;
      options?: string[];
      correctAnswer: any;
      explanation: string;
    }[];
    estimatedTime: number;
  }[];

  @Column({ type: 'json', nullable: true })
  progress: {
    completedModules: string[];
    currentModule: string;
    totalProgress: number;
  };

  @Column({ default: false })
  isPersonalized: boolean;

  @Column({ type: 'json', nullable: true })
  targetWeaknesses: string[];

  @ManyToOne(() => User, user => user.courses)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}