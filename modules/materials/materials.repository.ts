import { supabase } from '@/services/supabase';

export const MaterialsRepository = {
  async uploadFileToStorage(file: any, path: string) {
    // React Native File upload using fetch and blob
    const response = await fetch(file.uri);
    const blob = await response.blob();
    
    const { data, error } = await supabase.storage
      .from('materials') 
      .upload(path, blob, {
        contentType: file.mimeType,
        upsert: false
      });
      
    if (error) throw error;
    return data;
  },

  async createMaterialRecord(materialData: {
    classroom_id: string | null;
    teacher_id: string;
    title: string;
    file_type: string;
    storage_path: string;
    processing_status: 'pending' | 'processing' | 'done' | 'failed';
  }) {
    const { data, error } = await supabase
      .from('materials')
      .insert([materialData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRecentMaterials(teacherId: string) {
    const { data, error } = await supabase
      .from('materials')
      .select('*, classrooms(name)')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    return data;
  }
};
