export interface ConversationContext {
  studentId: string;
  lessonId: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}

class LearningMemoryStore {
  private memories: Map<string, ConversationContext> = new Map();

  private getMemoryKey(studentId: string, lessonId: string): string {
    return `${studentId}_${lessonId}`;
  }

  getHistory(studentId: string, lessonId: string): { role: 'user' | 'assistant'; content: string }[] {
    const key = this.getMemoryKey(studentId, lessonId);
    const context = this.memories.get(key);
    return context ? context.history : [];
  }

  addInteraction(studentId: string, lessonId: string, role: 'user' | 'assistant', content: string) {
    const key = this.getMemoryKey(studentId, lessonId);
    let context = this.memories.get(key);
    
    if (!context) {
      context = { studentId, lessonId, history: [] };
      this.memories.set(key, context);
    }
    
    context.history.push({ role, content });
    
    // Keep history manageable (e.g., last 10 interactions)
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }
  }

  clearHistory(studentId: string, lessonId: string) {
    const key = this.getMemoryKey(studentId, lessonId);
    this.memories.delete(key);
  }
}

export const LearningMemory = new LearningMemoryStore();
