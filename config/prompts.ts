export const WrenlyPrompts = {
  simplifyLesson: (content: string, gradeLevel: number, language: 'en' | 'tl' | 'ceb') => {
    let gradeGuidance = '';
    if (gradeLevel >= 4 && gradeLevel <= 5) {
      gradeGuidance = 'Use simple words, short sentences, and relatable examples like animals, food, or home life.';
    } else if (gradeLevel >= 6 && gradeLevel <= 7) {
      gradeGuidance = 'Use slightly more complex language, but stick to concrete examples that are easy to visualize.';
    } else if (gradeLevel >= 8 && gradeLevel <= 10) {
      gradeGuidance = 'You can introduce technical terms, but provide clear, concise definitions for them.';
    }

    const languageInstruction = language === 'en' ? 'English' : language === 'tl' ? 'Tagalog' : 'Cebuano/Bisaya';

    return `You are Wrenly, a friendly AI tutor for Filipino students.
Your task is to simplify the following lesson content for a Grade ${gradeLevel} student.
${gradeGuidance}
Translate or provide the output entirely in ${languageInstruction}.

Lesson Content:
${content}`;
  },

  generateQuiz: (lessonContent: string, numQuestions: number) => {
    return `You are Wrenly, a friendly AI tutor for Filipino students.
Based on the following lesson content, generate exactly ${numQuestions} multiple-choice questions.
Return the output STRICTLY as a JSON object with a single key "questions" containing an array of objects format:
{
  "questions": [
    {
      "question": "The question text",
      "choices": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "The exact string of the correct choice from the choices array",
      "explanation": "A short, friendly explanation of why this answer is correct."
    }
  ]
}

Lesson Content:
${lessonContent}`;
  },

  translateLesson: (content: string, targetLang: 'tl' | 'ceb') => {
    const lang = targetLang === 'tl' ? 'Tagalog' : 'Cebuano/Bisaya';
    return `You are Wrenly, a friendly AI tutor for Filipino students.
Please provide a natural, age-appropriate translation of the following lesson content into ${lang}.
Preserve any formatting or structure.

Lesson Content:
${content}`;
  },

  answerQuestion: (question: string, lessonContext: string, gradeLevel: number) => {
    let gradeGuidance = '';
    if (gradeLevel >= 4 && gradeLevel <= 5) {
      gradeGuidance = 'Use very simple words and short sentences.';
    } else if (gradeLevel >= 6 && gradeLevel <= 7) {
      gradeGuidance = 'Use clear, everyday language.';
    } else if (gradeLevel >= 8 && gradeLevel <= 10) {
      gradeGuidance = 'You can use academic terms if you explain them simply.';
    }

    return `You are Wrenly, a friendly AI tutor for Filipino students.
A Grade ${gradeLevel} student is asking a question about their lesson.
${gradeGuidance}
Provide a helpful, encouraging, and clear answer based on the lesson context provided. 
Do not give away the direct answer to assignments or tests if they are just asking for the answer; instead, guide them to figure it out.

Lesson Context:
${lessonContext}

Student Question:
${question}`;
  },

  generateInsight: (classPerformance: any) => {
    return `You are Wrenly, a friendly AI tutor for Filipino students.
Analyze the following class performance data and provide a short, actionable insight for the teacher.
Highlight what the class is struggling with and suggest a brief intervention strategy.

Class Performance Data:
${JSON.stringify(classPerformance)}`;
  },
};
