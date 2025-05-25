import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(this.configService.get('GEMINI_API_KEY') || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async generateAssessment(subject: string, difficulty: string = 'intermediate'): Promise<any> {
    const prompt = `Generate a comprehensive assessment for ${subject} at ${difficulty} level. 
    Create 15 multiple-choice questions covering different topics within ${subject}.
    
    Return a JSON object with the following structure:
    {
      "questions": [
        {
          "id": "unique_id",
          "question": "question text",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": 0,
          "topic": "specific topic",
          "difficulty": "easy|medium|hard"
        }
      ]
    }
    
    Ensure questions cover various difficulty levels and topics to properly assess student knowledge.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response from Gemini');
    } catch (error) {
      console.error('Error generating assessment:', error);
      throw error;
    }
  }

  async analyzeAssessmentResults(assessment: any, answers: any[]): Promise<any> {
    const prompt = `Analyze the following assessment results and provide detailed insights:
    
    Assessment: ${JSON.stringify(assessment.questions)}
    Student Answers: ${JSON.stringify(answers)}
    
    Provide analysis in the following JSON format:
    {
      "overallScore": number (0-100),
      "topicScores": {
        "topic1": score,
        "topic2": score
      },
      "weakAreas": ["area1", "area2"],
      "strongAreas": ["area1", "area2"],
      "recommendations": ["recommendation1", "recommendation2"],
      "learningStyle": "visual|auditory|kinesthetic|reading",
      "suggestedPace": "slow|normal|fast"
    }
    
    Focus on identifying specific knowledge gaps and provide actionable recommendations.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response from Gemini');
    } catch (error) {
      console.error('Error analyzing assessment:', error);
      throw error;
    }
  }

  async generatePersonalizedCourse(
    subject: string,
    weaknesses: string[],
    strengths: string[],
    learningStyle: string,
    difficulty: string = 'intermediate'
  ): Promise<any> {
    // Filter or note if weaknesses/strengths are empty
    const relevantWeaknesses = weaknesses.length > 0 ? weaknesses : ['general concepts'];
    const relevantStrengths = strengths.length > 0 ? strengths : ['foundational knowledge'];
  
    const prompt = `Create a personalized course SPECIFICALLY for ${subject}. 
  
  IMPORTANT: This course must focus ONLY on ${subject} topics. Do not include content from other subjects.
  
  ${weaknesses.length > 0 ? `Student Weaknesses in ${subject}: ${relevantWeaknesses.join(', ')}` : `This is a general ${subject} course as no specific weaknesses were identified.`}
  ${strengths.length > 0 ? `Student Strengths in ${subject}: ${relevantStrengths.join(', ')}` : ''}
  Learning Style: ${learningStyle}
  Difficulty Level: ${difficulty}
  
  Generate a comprehensive ${subject} course with 5-7 modules. ${weaknesses.length > 0 ? 'Each module should focus on addressing the identified weaknesses within ' + subject + ' only.' : 'Cover fundamental ' + subject + ' concepts progressively.'}
  
  Return JSON in this format:
  {
    "title": "Course Title for ${subject}",
    "description": "Course description focusing on ${subject}",
    "modules": [
      {
        "id": "module_id",
        "title": "Module Title (must be ${subject}-related)",
        "content": "Detailed lesson content with ${subject}-specific explanations, examples, and concepts. Do NOT include examples from other subjects.",
        "exercises": [
          {
            "id": "exercise_id",
            "type": "multiple-choice",
            "question": "Exercise question about ${subject}",
            "options": ["option1", "option2", "option3", "option4"],
            "correctAnswer": 0,
            "explanation": "Explanation related to ${subject} concepts"
          }
        ],
        "estimatedTime": 30
      }
    ]
  }
  
  All content, examples, and exercises MUST be specifically about ${subject}. Do not mix in content from other subjects.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
    
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response from Gemini');
    } catch (error) {
      console.error('Error generating course:', error);
      throw error;
    }
  }
}
