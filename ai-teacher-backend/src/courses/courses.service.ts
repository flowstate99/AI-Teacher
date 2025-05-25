// src/courses/courses.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Course } from './course.entity';
import { GeminiService } from '../gemini/gemini.service';
import { UsersService } from '../users/users.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GeneratePersonalizedCourseDto } from './dto/generate-personalized-course.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { Assessment } from '../assessments/assessment.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    private geminiService: GeminiService,
    private usersService: UsersService,
  ) {}

  async create(createCourseDto: CreateCourseDto, userId: number): Promise<Course> {
    const user = await this.usersService.findOne(userId);
    
    const course = this.courseRepository.create({
      ...createCourseDto,
      user,
      progress: {
        completedModules: [],
        currentModule: createCourseDto.modules?.[0]?.id || '',
        totalProgress: 0,
      },
    });

    return await this.courseRepository.save(course);
  }

  async findAll(userId: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto, userId: number): Promise<Course> {
    const course = await this.findOne(id, userId);
    
    Object.assign(course, updateCourseDto);
    
    return await this.courseRepository.save(course);
  }

  async remove(id: number, userId: number): Promise<void> {
    const course = await this.findOne(id, userId);
    await this.courseRepository.remove(course);
  }

async generatePersonalizedCourse(
  generateDto: GeneratePersonalizedCourseDto,
  userId: number,
): Promise<Course> {
  const user = await this.usersService.findOne(userId);
  
  // Get subject-specific strengths and weaknesses from assessments
  const subjectProfile = await this.getSubjectSpecificProfile(userId, generateDto.subject);
  
  // Use subject-specific profile if available, otherwise use defaults
  const strengths = subjectProfile.strengths || [];
  const weaknesses = subjectProfile.weaknesses || [];
  const preferredStyle = user.learningProfile?.preferredStyle || 'mixed';
  const pace = user.learningProfile?.pace || 'normal';
  
  console.log(`Generating course for ${generateDto.subject} with profile:`, {
    strengths,
    weaknesses,
    preferredStyle,
    pace
  });
  
  try {
    const generatedCourse = await this.geminiService.generatePersonalizedCourse(
      generateDto.subject,
      weaknesses,
      strengths,
      preferredStyle,
      generateDto.difficulty || 'intermediate',
    );

    const course = this.courseRepository.create({
      title: generatedCourse.title,
      description: generatedCourse.description,
      subject: generateDto.subject,
      difficulty: generateDto.difficulty || 'intermediate',
      modules: generatedCourse.modules,
      isPersonalized: true,
      targetWeaknesses: weaknesses,
      user,
      progress: {
        completedModules: [],
        currentModule: generatedCourse.modules?.[0]?.id || '',
        totalProgress: 0,
      },
    });

    return await this.courseRepository.save(course);
  } catch (error) {
    console.error('Failed to generate personalized course:', error);
    throw new BadRequestException(`Failed to generate personalized course: ${error.message}`);
  }
}

// Add this new method to get subject-specific learning profile
private async getSubjectSpecificProfile(userId: number, subject: string): Promise<{
  strengths: string[];
  weaknesses: string[];
}> {
  // Get all completed assessments for this user and subject
  const assessments = await this.assessmentRepository.find({
    where: {
      user: { id: userId },
      subject: subject,
      analysis: Not(IsNull()), // Only completed assessments
    },
    order: {
      createdAt: 'DESC',
    },
    take: 5, // Consider last 5 assessments for this subject
  });

  if (assessments.length === 0) {
    return { strengths: [], weaknesses: [] };
  }

  // Aggregate strengths and weaknesses from these assessments
  const strengthsMap = new Map<string, number>();
  const weaknessesMap = new Map<string, number>();

  assessments.forEach(assessment => {
    const analysis = assessment.analysis;
    
    // Count occurrences of each strength
    if (analysis.strongAreas && Array.isArray(analysis.strongAreas)) {
      analysis.strongAreas.forEach(area => {
        strengthsMap.set(area, (strengthsMap.get(area) || 0) + 1);
      });
    }
    
    // Count occurrences of each weakness
    if (analysis.weakAreas && Array.isArray(analysis.weakAreas)) {
      analysis.weakAreas.forEach(area => {
        weaknessesMap.set(area, (weaknessesMap.get(area) || 0) + 1);
      });
    }
  });

  // Sort by frequency and get top areas
  const strengths = Array.from(strengthsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area);
    
  const weaknesses = Array.from(weaknessesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area);

  return { strengths, weaknesses };
}

  async updateProgress(
    id: number,
    updateProgressDto: UpdateProgressDto,
    userId: number,
  ): Promise<Course> {
    const course = await this.findOne(id, userId);
    
    const { moduleId, completed, timeSpent, exerciseResults } = updateProgressDto;
    
    // Update completed modules
    if (completed && !course.progress.completedModules.includes(moduleId)) {
      course.progress.completedModules.push(moduleId);
    }
    
    // Update current module to next uncompleted module
    const nextModule = course.modules.find(
      module => !course.progress.completedModules.includes(module.id)
    );
    course.progress.currentModule = nextModule?.id || '';
    
    // Calculate total progress
    course.progress.totalProgress = Math.round(
      (course.progress.completedModules.length / course.modules.length) * 100
    );
    
    // Store exercise results and time spent (you might want to create a separate entity for this)
    if (exerciseResults || timeSpent) {
      // In a real app, you'd store this in a separate progress/activity table
      console.log(`User ${userId} spent ${timeSpent}ms on module ${moduleId}`);
      console.log('Exercise results:', exerciseResults);
    }
    
    return await this.courseRepository.save(course);
  }

  async getCoursesBySubject(subject: string, userId: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { 
        subject: subject,
        user: { id: userId }
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getRecommendedCourses(userId: number): Promise<Course[]> {
    const user = await this.usersService.findOne(userId);
    
    if (!user.learningProfile?.weaknesses) {
      return [];
    }
    
    // Find courses that target the user's weak areas
    const recommendedCourses = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.isPersonalized = :isPersonalized', { isPersonalized: true })
      .andWhere('course.userId != :userId', { userId })
      .andWhere('course.targetWeaknesses IS NOT NULL')
      .getMany();
    
    // Filter courses that address user's weaknesses
    return recommendedCourses.filter(course => 
      course.targetWeaknesses?.some(weakness => 
        user.learningProfile.weaknesses.includes(weakness)
      )
    ).slice(0, 5); // Limit to 5 recommendations
  }

  async getCourseStats(userId: number): Promise<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalTimeSpent: number;
    averageProgress: number;
    subjectBreakdown: { [subject: string]: number };
    completionRate: number;
  }> {
    const courses = await this.findAll(userId);
    
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.progress?.totalProgress === 100).length;
    const inProgressCourses = courses.filter(c => 
      c.progress?.totalProgress > 0 && c.progress?.totalProgress < 100
    ).length;
    
    const averageProgress = totalCourses > 0 
      ? courses.reduce((sum, course) => sum + (course.progress?.totalProgress || 0), 0) / totalCourses
      : 0;
    
    const subjectBreakdown: { [subject: string]: number } = {};
    courses.forEach(course => {
      subjectBreakdown[course.subject] = (subjectBreakdown[course.subject] || 0) + 1;
    });
    
    const completionRate = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;
    
    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalTimeSpent: 0, // Would come from detailed progress tracking
      averageProgress: Math.round(averageProgress),
      subjectBreakdown,
      completionRate: Math.round(completionRate),
    };
  }

  async duplicateCourse(id: number, userId: number): Promise<Course> {
    const originalCourse = await this.findOne(id, userId);
    
    const duplicatedCourse = this.courseRepository.create({
      title: `${originalCourse.title} (Copy)`,
      description: originalCourse.description,
      subject: originalCourse.subject,
      difficulty: originalCourse.difficulty,
      modules: originalCourse.modules,
      isPersonalized: false,
      user: originalCourse.user,
      progress: {
        completedModules: [],
        currentModule: originalCourse.modules?.[0]?.id || '',
        totalProgress: 0,
      },
    });
    
    return await this.courseRepository.save(duplicatedCourse);
  }

  async searchCourses(query: string, userId: number): Promise<Course[]> {
    return await this.courseRepository
      .createQueryBuilder('course')
      .where('course.userId = :userId', { userId })
      .andWhere(
        '(course.title LIKE :query OR course.description LIKE :query OR course.subject LIKE :query)',
        { query: `%${query}%` }
      )
      .orderBy('course.createdAt', 'DESC')
      .getMany();
  }

  async generateCourseFromTemplate(
    subject: string,
    template: string,
    userId: number,
  ): Promise<Course> {
    try {
      const user = await this.usersService.findOne(userId);
      const userStyle = user.learningProfile?.preferredStyle || 'mixed';
      
      const generatedCourse = await this.geminiService.generatePersonalizedCourse(
        subject,
        [], // No specific weaknesses for template-based courses
        [],
        userStyle,
        'intermediate',
      );

      const course = this.courseRepository.create({
        title: `${subject} - ${template}`,
        description: generatedCourse.description,
        subject,
        difficulty: 'intermediate',
        modules: generatedCourse.modules,
        isPersonalized: false,
        user,
        progress: {
          completedModules: [],
          currentModule: generatedCourse.modules?.[0]?.id || '',
          totalProgress: 0,
        },
      });

      return await this.courseRepository.save(course);
    } catch (error) {
      throw new BadRequestException(`Failed to generate course from template: ${error.message}`);
    }
  }
}