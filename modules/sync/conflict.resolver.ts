export const ConflictResolver = {
  /**
   * Resolves conflicts for lessons.
   * Server always wins for curriculum content.
   */
  resolveLessonConflict(localLesson: any, serverLesson: any) {
    return serverLesson;
  },

  /**
   * Resolves conflicts for quiz attempts.
   * Local wins for attempts (students' work must not be lost).
   */
  resolveAttemptConflict(localAttempt: any, serverAttempt: any) {
    if (!serverAttempt) return localAttempt;
    
    return {
      ...serverAttempt,
      score: localAttempt.score,
      answers: localAttempt.answers,
      completed_at: localAttempt.completed_at
    };
  }
};
