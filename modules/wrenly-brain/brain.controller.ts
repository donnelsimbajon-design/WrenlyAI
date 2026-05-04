import { openaiClient } from '@/modules/ai-engine/openai.service';
import { WrenlyPrompts } from '@/config/prompts';
import { LearningMemory } from './learning.memory';

export class BrainController {
  /**
   * Handles a student's question, incorporating learning memory for context.
   */
  static async askQuestion(
    studentId: string,
    lessonId: string,
    question: string,
    lessonContext: string,
    gradeLevel: number
  ): Promise<string> {
    const prompt = WrenlyPrompts.answerQuestion(question, lessonContext, gradeLevel);
    
    // Get past history for this lesson and student
    const history = LearningMemory.getHistory(studentId, lessonId);
    
    // Build messages array
    const messages: any[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...history, // Add past conversation context
      { role: 'user', content: prompt } // Add current question with prompt wrapping
    ];

    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gemini-2.5-flash',
        messages,
        temperature: 0.7,
      });

      const answer = response.choices[0]?.message?.content || '';
      
      // Save this interaction to memory
      LearningMemory.addInteraction(studentId, lessonId, 'user', question);
      LearningMemory.addInteraction(studentId, lessonId, 'assistant', answer);

      return answer;
    } catch (error) {
      console.error('BrainController askQuestion error:', error);
      throw new Error('Wrenly is having trouble thinking right now. Please try again.');
    }
  }

  /**
   * Handles general chat messages for the global Wrenly assistant.
   */
  static async globalChat(
    studentId: string,
    message: string,
    history: any[]
  ): Promise<string> {
    const messages: any[] = [
      { role: 'system', content: 'You are Wrenly, a friendly, encouraging, and helpful AI learning assistant for students. Explain concepts simply and clearly. Use modern, engaging language.' },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gemini-2.5-flash',
        messages,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'I am not sure how to answer that right now.';
    } catch (error) {
      console.error('BrainController globalChat error:', error);
      throw new Error('Wrenly is having trouble thinking right now. Please try again.');
    }
  }

  /**
   * Generates a quick insight for a teacher's analytics dashboard.
   */
  static async getTeacherInsight(classPerformance: any): Promise<string> {
    const prompt = WrenlyPrompts.generateInsight(classPerformance);
    
    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('BrainController getTeacherInsight error:', error);
      return 'No insights could be generated at this time.';
    }
  }
}
