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
    const prompt = `Generate a high-quality, comprehensive assessment for the subject "${subject}" at a ${difficulty} difficulty level.
    The assessment should consist of exactly 15 multiple-choice questions.
    These questions must cover a diverse range of topics within "${subject}".
    
    For each question, provide:
    1. A unique "id" (e.g., a UUID v4 style string like "q_uuid_1", "q_uuid_2").
    2. Clear and unambiguous "question" text.
    3. Four distinct "options". Avoid obviously incorrect or trick options where possible; aim for plausible distractors.
    4. The "correctAnswer" index (0-3).
    5. A concise "topic" that the question addresses within "${subject}".
    6. An accurate "difficulty" rating ("easy", "medium", or "hard") for the specific question, contributing to the overall ${difficulty} level of the assessment.
    7. A brief but clear "explanation" for why the correct answer is right.
    
    Return a single, valid JSON object with the following structure:
    {
      "questions": [
        {
          "id": "unique_id_string_1",
          "question": "Question text here.",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0, // Index of the correct option
          "topic": "Specific topic within ${subject}",
          "difficulty": "easy|medium|hard",
          "explanation": "Brief explanation of the correct answer."
        }
        // ... (14 more questions)
      ]
    }
    
    Ensure the overall assessment effectively gauges student knowledge across various facets of "${subject}" and difficulty spectrums appropriate for the ${difficulty} level.
    The JSON output must be clean and strictly adhere to the specified format.
    If any mathematical expressions, equations, or symbols are needed, format them using LaTeX (enclose inline math in $...$ and display math in $$...$$). Do not use Markdown math formatting, only LaTeX as described.`;

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
    const prompt = `Analyze the provided assessment results meticulously.
    Assessment Questions (including correct answers and topics): ${JSON.stringify(assessment.questions)}
    Student's Answers (selected options and other metadata): ${JSON.stringify(answers)}
    
    Based on this data, generate a comprehensive analysis.
    
    Calculate the "overallScore" as a percentage (0-100) based on the number of correct answers.
    Calculate "topicScores" for each topic present in the assessment questions, also as a percentage (0-100).
    Identify "weakAreas" (topics where the student scored below 60%).
    Identify "strongAreas" (topics where the student scored 80% or above).
    Provide specific, actionable "recommendations" (2-3 suggestions) to help the student improve, focusing on their weak areas and leveraging their strong areas.
    Suggest a "learningStyle" ("visual", "auditory", "kinesthetic", "reading", or "mixed") based on patterns in their performance (e.g., types of questions answered correctly/incorrectly, time spent if available). Justify briefly if not obvious.
    Suggest an appropriate "suggestedPace" ("slow", "normal", "fast") for future learning in this subject, considering their accuracy and speed (if timeSpent data is available and significant).
    
    Return a single, valid JSON object with the following structure:
    {
      "overallScore": number, // e.g., 75
      "topicScores": { // Key: topic string, Value: score (0-100)
        "Specific Topic A": 50,
        "Specific Topic B": 85
      },
      "weakAreas": ["Topic X", "Topic Y"], // List of topic strings
      "strongAreas": ["Topic Z", "Topic W"], // List of topic strings
      "recommendations": [
        "Focus on practicing problems related to [Weak Topic 1].",
        "Review the fundamental concepts of [Weak Topic 2] using [Suggested Learning Style] resources."
      ],
      "learningStyle": "visual|auditory|kinesthetic|reading|mixed",
      "suggestedPace": "slow|normal|fast"
    }
    
    Ensure all calculations are accurate and the analysis is insightful and directly derived from the provided data. The JSON output must be clean and strictly adhere to the specified format.
    If any mathematical expressions, equations, or symbols are needed, format them using LaTeX (enclose inline math in $...$ and display math in $$...$$). Do not use Markdown math formatting, only LaTeX as described.`;

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
  
    const prompt = `Create a high-quality, personalized course SPECIFICALLY and EXCLUSIVELY for the subject "${subject}".
    
    User Profile:
    - Subject: "${subject}"
    - ${weaknesses.length > 0 ? `Identified Weaknesses in "${subject}": ${relevantWeaknesses.join(', ')}.` : `No specific weaknesses in "${subject}" identified; focus on a solid foundation.`}
    - ${strengths.length > 0 ? `Identified Strengths in "${subject}": ${relevantStrengths.join(', ')}.` : `No specific strengths in "${subject}" identified.`}
    - Preferred Learning Style: ${learningStyle}
    - Target Difficulty Level: ${difficulty}
    
    Course Requirements:
    1.  The course must consist of 5 to 7 modules.
    2.  ABSOLUTE FOCUS: All content, including titles, descriptions, module content, examples, and exercises, MUST be strictly related to "${subject}". Do NOT introduce concepts, examples, or terminology from any other subject.
    3.  Module Content: Each module should provide detailed, clear, and engaging educational content.
        - If weaknesses are specified, modules should strategically address them.
        - If no weaknesses, build a progressive understanding of core "${subject}" concepts.
        - Incorporate examples and explanations that align with the user's "${learningStyle}" learning style. For example, use diagrams/visuals for "visual", scenarios/discussions for "auditory", interactive thought-exercises for "kinesthetic", detailed text for "reading".
    4.  Exercises: Each module must include 2-3 relevant exercises (e.g., multiple-choice, fill-in-the-blank) designed to reinforce the module's learning objectives for "${subject}". Each exercise needs an explanation.
    5.  Structure: The course should have a logical flow, building knowledge incrementally.
    
    Return a single, valid JSON object with the following structure:
    {
      "title": "Personalized Course Title for ${subject}",
      "description": "A concise and engaging description of this ${subject} course, highlighting its personalized nature and learning objectives.",
      "modules": [
        {
          "id": "module_uuid_1", // Unique ID for the module
          "title": "Module Title (clearly ${subject}-related)",
          "content": "Comprehensive lesson content for this ${subject} module. This should be well-structured, easy to understand, and incorporate ${learningStyle}-friendly elements. For example: ... (actual content here, not just a placeholder)",
          "exercises": [
            {
              "id": "exercise_uuid_1_1", // Unique ID for the exercise
              "type": "multiple_choice", // Or other simple types like "fill_in_blank"
              "question": "A ${subject}-specific question testing understanding of this module's content.",
              "options": ["Option A", "Option B", "Option C", "Option D"], // For multiple_choice
              "correctAnswer": 0, // Index for multiple_choice, or correct string for fill_in_blank
              "explanation": "Clear explanation for the correct answer, reinforcing ${subject} concepts."
            }
            // ... (more exercises for this module)
          ],
          "estimatedTime": 30 // Estimated time in minutes to complete the module
        }
        // ... (more modules, 5-7 total)
      ]
    }
    
    Ensure the JSON is well-formed and strictly adheres to this structure. The quality, relevance, and subject-specificity of the content are paramount.
    If any mathematical expressions, equations, or symbols are needed, format them using LaTeX (enclose inline math in $...$ and display math in $$...$$). Do not use Markdown math formatting, only LaTeX as described.`;

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
