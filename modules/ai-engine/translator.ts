import { openaiClient } from './openai.service';
import { WrenlyPrompts } from '@/config/prompts';

export class Translator {
  static async translate(content: string, targetLang: 'tl' | 'ceb'): Promise<string> {
    const prompt = WrenlyPrompts.translateLesson(content, targetLang);
    
    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content || content;
    } catch (error) {
      console.error('Error translating lesson:', error);
      throw new Error('Failed to translate content.');
    }
  }
}
