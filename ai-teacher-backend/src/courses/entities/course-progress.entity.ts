import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Course } from './course.entity';
import { User } from '../../users/user.entity';

@Entity()
export class CourseProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, course => course.id)
  course: Course;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @Column()
  moduleId: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'json', nullable: true })
  exerciseResults: {
    exerciseId: string;
    answer: any;
    isCorrect: boolean;
    timeSpent: number;
    attempts: number;
  }[];

  @Column({ default: 0 })
  timeSpent: number;

  @Column({ type: 'float', default: 0 })
  comprehensionScore: number;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}