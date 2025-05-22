import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AiService {
  constructor(private readonly httpService: HttpService) {}

  async generateCourse(topic: string, level: 'beginner' | 'intermediate' | 'advanced') {
    const prompt = `Create a ${level} course outline on "${topic}" with at least 5 lessons.`;

    const response = await firstValueFrom(
      this.httpService.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: process.env.GEMINI_API_KEY,
          },
        },
      ),
    );

    // Gemini's response structure
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}
