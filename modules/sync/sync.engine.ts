import { OfflineService } from '../offline/offline.service';
import { supabase } from '@/services/supabase';
import { ConflictResolver } from './conflict.resolver';

export const SyncEngine = {
  isSyncing: false,

  async sync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Upload unsynced quiz attempts
      const unsyncedAttempts: any[] = await OfflineService.getUnsyncedQuizAttempts();
      
      for (const attempt of unsyncedAttempts) {
        // Attempt to upload to Supabase
        const { data: existingServer } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('id', attempt.id)
          .single();

        let payload = attempt;
        if (existingServer) {
          payload = ConflictResolver.resolveAttemptConflict(attempt, existingServer);
        }

        let answersData = [];
        try {
          answersData = JSON.parse(payload.answers);
        } catch(e) {}

        const { error } = await supabase
          .from('quiz_attempts')
          .upsert({
            id: payload.id,
            quiz_id: payload.quiz_id,
            student_id: payload.student_id,
            score: payload.score,
            answers: answersData,
            completed_at: payload.completed_at
          });

        if (!error) {
          await OfflineService.markAttemptSynced(attempt.id);
        }
      }

      // 2. We could handle fetching updated lessons here...

    } catch (err) {
      console.error('Sync Error', err);
    } finally {
      this.isSyncing = false;
    }
  }
};
