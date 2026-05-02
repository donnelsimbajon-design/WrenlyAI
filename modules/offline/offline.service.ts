import { getDB } from './offlineDb';

export const OfflineService = {
  async saveLesson(lesson: any, fileSize: number = 0) {
    const db = await getDB();
    await db.runAsync(
      `INSERT OR REPLACE INTO lessons (id, title, content_en, content_tl, content_ceb, grade_level, file_size, downloaded_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lesson.id, 
        lesson.title, 
        lesson.content_en, 
        lesson.content_tl, 
        lesson.content_ceb, 
        lesson.grade_level,
        fileSize,
        new Date().toISOString()
      ]
    );
  },

  async getLesson(id: string) {
    const db = await getDB();
    const result = await db.getFirstAsync('SELECT * FROM lessons WHERE id = ?', [id]);
    return result as any;
  },

  async getAllLessons() {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM lessons ORDER BY downloaded_at DESC');
  },

  async deleteLesson(id: string) {
    const db = await getDB();
    await db.runAsync('DELETE FROM lessons WHERE id = ?', [id]);
  },

  async queueQuizAttempt(attempt: any) {
    const db = await getDB();
    await db.runAsync(
      `INSERT INTO quiz_attempts (id, quiz_id, student_id, score, answers, completed_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        attempt.id || Date.now().toString(),
        attempt.quiz_id,
        attempt.student_id,
        attempt.score,
        JSON.stringify(attempt.answers),
        new Date().toISOString()
      ]
    );
  },

  async getUnsyncedQuizAttempts() {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM quiz_attempts WHERE synced = 0');
  },

  async markAttemptSynced(id: string) {
    const db = await getDB();
    await db.runAsync('UPDATE quiz_attempts SET synced = 1 WHERE id = ?', [id]);
  }
};
