import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'learningProfile', 'createdAt'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'learningProfile', 'createdAt'],
      relations: ['assessments', 'courses'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    Object.assign(user, updateUserDto);
    
    return await this.userRepository.save(user);
  }

  async updateLearningProfile(id: number, learningProfile: {
    strengths: string[];
    weaknesses: string[];
    preferredStyle: string;
    pace: string;
  }): Promise<User> {
    const user = await this.findOne(id);
    
    user.learningProfile = {
      ...user.learningProfile,
      ...learningProfile,
    };
    
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async getUserStats(id: number): Promise<{
    totalAssessments: number;
    totalCourses: number;
    completedCourses: number;
    averageScore: number;
    learningStreak: number;
    weaknessesAddressed: number;
  }> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['assessments', 'courses'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const totalAssessments = user.assessments?.length || 0;
    const totalCourses = user.courses?.length || 0;
    const completedCourses = user.courses?.filter(course => 
      course.progress?.totalProgress === 100
    ).length || 0;

    // Calculate average score from assessments
    const averageScore = totalAssessments > 0 
      ? user.assessments.reduce((sum, assessment) => 
          sum + (assessment.analysis?.overallScore || 0), 0
        ) / totalAssessments
      : 0;

    // Calculate learning streak (days with activity)
    const learningStreak = this.calculateLearningStreak(user);

    // Count addressed weaknesses
    const weaknessesAddressed = this.countAddressedWeaknesses(user);

    return {
      totalAssessments,
      totalCourses,
      completedCourses,
      averageScore: Math.round(averageScore),
      learningStreak,
      weaknessesAddressed,
    };
  }

  private calculateLearningStreak(user: User): number {
    // Simple implementation - count consecutive days with course progress
    // In a real app, you'd track daily activity more precisely
    const recentActivities = [
      ...user.assessments.map(a => a.createdAt),
      ...user.courses.map(c => c.createdAt),
    ].sort((a, b) => b.getTime() - a.getTime());

    if (recentActivities.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if there's activity today or yesterday
    const latestActivity = recentActivities[0];
    const daysDiff = Math.floor(
      (today.getTime() - latestActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 1) return 0; // No recent activity

    // Count consecutive days (simplified logic)
    for (let i = 1; i < Math.min(recentActivities.length, 30); i++) {
      const current = recentActivities[i];
      const previous = recentActivities[i - 1];
      const daysBetween = Math.floor(
        (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysBetween <= 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private countAddressedWeaknesses(user: User): number {
    if (!user.learningProfile?.weaknesses || !user.courses) {
      return 0;
    }

    const weaknesses = user.learningProfile.weaknesses;
    const personalizedCourses = user.courses.filter(course => 
      course.isPersonalized && course.targetWeaknesses
    );

    const addressedWeaknesses = new Set();

    personalizedCourses.forEach(course => {
      course.targetWeaknesses?.forEach(weakness => {
        if (weaknesses.includes(weakness)) {
          addressedWeaknesses.add(weakness);
        }
      });
    });

    return addressedWeaknesses.size;
  }

  async getUserProgress(id: number): Promise<{
    overallProgress: number;
    subjectProgress: { [subject: string]: number };
    recentActivity: any[];
    nextRecommendations: string[];
  }> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['assessments', 'courses'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Calculate overall progress
    const totalCourses = user.courses?.length || 0;
    const overallProgress = totalCourses > 0
      ? user.courses.reduce((sum, course) => 
          sum + (course.progress?.totalProgress || 0), 0
        ) / totalCourses
      : 0;

    // Calculate subject-wise progress
    const subjectProgress: { [subject: string]: number } = {};
    user.courses?.forEach(course => {
      if (!subjectProgress[course.subject]) {
        subjectProgress[course.subject] = 0;
      }
      subjectProgress[course.subject] += course.progress?.totalProgress || 0;
    });

    // Average progress per subject
    Object.keys(subjectProgress).forEach(subject => {
      const subjectCourses = user.courses.filter(c => c.subject === subject).length;
      subjectProgress[subject] = subjectCourses > 0 
        ? subjectProgress[subject] / subjectCourses 
        : 0;
    });

    // Get recent activity
    const recentActivity = [
      ...user.assessments.slice(-5).map(assessment => ({
        type: 'assessment',
        subject: assessment.subject,
        score: assessment.analysis?.overallScore,
        date: assessment.createdAt,
      })),
      ...user.courses.slice(-5).map(course => ({
        type: 'course',
        title: course.title,
        subject: course.subject,
        progress: course.progress?.totalProgress,
        date: course.createdAt,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    // Generate recommendations based on learning profile
    const nextRecommendations = this.generateRecommendations(user);

    return {
      overallProgress: Math.round(overallProgress),
      subjectProgress,
      recentActivity,
      nextRecommendations,
    };
  }

  private generateRecommendations(user: User): string[] {
    const recommendations: string[] = [];

    if (!user.learningProfile) {
      recommendations.push("Take an assessment to discover your learning style");
      return recommendations;
    }

    const { weaknesses, strengths, preferredStyle, pace } = user.learningProfile;

    // Recommendations based on weaknesses
    if (weaknesses && weaknesses.length > 0) {
      recommendations.push(
        `Focus on improving ${weaknesses.slice(0, 2).join(' and ')}`
      );
    }

    // Recommendations based on learning style
    if (preferredStyle === 'visual') {
      recommendations.push("Try courses with more diagrams and visual content");
    } else if (preferredStyle === 'auditory') {
      recommendations.push("Look for courses with audio explanations");
    } else if (preferredStyle === 'kinesthetic') {
      recommendations.push("Engage with interactive exercises and hands-on activities");
    }

    // Recommendations based on pace
    if (pace === 'fast') {
      recommendations.push("Challenge yourself with advanced difficulty levels");
    } else if (pace === 'slow') {
      recommendations.push("Take your time with foundational concepts");
    }

    // General recommendations
    const incompleteCourses = user.courses?.filter(course => 
      course.progress?.totalProgress < 100
    ).length || 0;

    if (incompleteCourses > 0) {
      recommendations.push(`Complete ${incompleteCourses} ongoing course${incompleteCourses > 1 ? 's' : ''}`);
    }

    if (user.assessments?.length === 0) {
      recommendations.push("Take your first assessment to get personalized courses");
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  async searchUsers(query: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.firstName LIKE :query OR user.lastName LIKE :query OR user.email LIKE :query', {
        query: `%${query}%`,
      })
      .select(['user.id', 'user.email', 'user.firstName', 'user.lastName', 'user.createdAt'])
      .getMany();
  }

  async updateUserPreferences(id: number, preferences: {
    notifications?: boolean;
    theme?: string;
    language?: string;
    difficulty?: string;
  }): Promise<User> {
    const user = await this.findOne(id);
    
    // Store preferences in learning profile
    user.learningProfile = {
      strengths: user.learningProfile?.strengths || [],
      weaknesses: user.learningProfile?.weaknesses || [],
      preferredStyle: user.learningProfile?.preferredStyle || 'mixed',
      pace: user.learningProfile?.pace || 'normal',
      preferences,
    } as any;
    
    return await this.userRepository.save(user);
  }
}