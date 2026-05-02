import { supabase } from '@/services/supabase';

export const LessonRepository = {
  async getLessonById(id: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, materials(title, storage_path)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
  
  // A local fallback placeholder for now before Phase 8 (Offline System) fully implements SQLite
  async getLessonByIdOffline(id: string) {
    throw new Error('Offline SQLite database not fully initialized yet.');
  }
};
