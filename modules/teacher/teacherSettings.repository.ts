import { supabase } from '@/services/supabase';

export interface AISettings {
  target_grade_level: number;
  auto_generate_quiz: boolean;
  enable_tl: boolean;
  enable_ceb: boolean;
  updated_at?: string;
}

export const TeacherSettingsRepository = {
  async getSettings(teacherId: string): Promise<AISettings | null> {
    const { data, error } = await supabase
      .from('teacher_settings')
      .select('*')
      .eq('teacher_id', teacherId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
      return null;
    }
    return data;
  },

  async saveSettings(teacherId: string, settings: Omit<AISettings, 'updated_at'>) {
    const { data, error } = await supabase
      .from('teacher_settings')
      .upsert({
        teacher_id: teacherId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
