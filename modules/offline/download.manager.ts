import { OfflineService } from './offline.service';

export const DownloadManager = {
  /**
   * Simulates downloading a lesson and storing it in SQLite.
   * In a real scenario, this fetches from Supabase and downloads attached files to FileSystem.
   */
  async downloadLesson(lessonData: any) {
    try {
      // Simulate network request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rough estimation of file size (e.g. text length + mock image size)
      const mockFileSize = Math.floor(Math.random() * 5 * 1024 * 1024) + (1024 * 1024); // 1MB to 6MB
      
      await OfflineService.saveLesson(lessonData, mockFileSize);
      return true;
    } catch (e) {
      console.error('Download error', e);
      return false;
    }
  },

  async getStorageStats() {
    try {
      const lessons: any[] = await OfflineService.getAllLessons();
      const totalBytes = lessons.reduce((acc, curr) => acc + (curr.file_size || 0), 0);
      const unsyncedAttempts: any[] = await OfflineService.getUnsyncedQuizAttempts();
      
      return {
        totalBytes,
        lessonsAvailable: lessons.length,
        pendingSync: unsyncedAttempts.length,
        downloadedLessons: lessons
      };
    } catch (e) {
       // Graceful fallback if SQLite isn't fully ready
       return { totalBytes: 0, lessonsAvailable: 0, pendingSync: 0, downloadedLessons: [] };
    }
  }
};
