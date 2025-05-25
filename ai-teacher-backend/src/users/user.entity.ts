import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Assessment } from '../assessments/assessment.entity';
import { Course } from '../courses/course.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'json', nullable: true })
  learningProfile: {
    strengths: string[];
    weaknesses: string[];
    preferredStyle: string;
    pace: string;
  };

  @OneToMany(() => Assessment, assessment => assessment.user)
  assessments: Assessment[];

  @OneToMany(() => Course, course => course.user)
  courses: Course[];

  @CreateDateColumn()
  createdAt: Date;
}