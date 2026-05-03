import { openaiClient } from './openai.service';
import { WrenlyPrompts } from '@/config/prompts';

export class QuizGenerator {
  static async generate(lessonContent: string, numQuestions: number = 5): Promise<any[]> {
    const prompt = WrenlyPrompts.generateQuiz(lessonContent, numQuestions);
    
    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gemini-1.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content || '{"questions": []}';
      
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch(e) {
        // Fallback for markdown blocks
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }
      
      return Array.isArray(parsed) ? parsed : (parsed.questions || []);
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz.');
    }
  }
}
