import { openaiClient } from './openai.service';
import { WrenlyPrompts } from '@/config/prompts';

export class LessonProcessor {
  static async processRawText(
    rawText: string, 
    gradeLevel: number, 
    language: 'en' | 'tl' | 'ceb' = 'en'
  ): Promise<string> {
    const prompt = WrenlyPrompts.simplifyLesson(rawText, gradeLevel, language);
    
    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o', // Use GPT-4o as specified
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error processing lesson:', error);
      throw new Error('Failed to process lesson text.');
    }
  }
}
