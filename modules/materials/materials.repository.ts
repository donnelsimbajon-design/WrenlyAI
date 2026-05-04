import { supabase } from '@/services/supabase';

export const MaterialsRepository = {
  async uploadFileToStorage(file: any, path: string) {
    try {
      // Fetch file from URI and convert to blob
      const response = await fetch(file.uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const blob = await response.blob();
      
      // Get the current session to ensure auth
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        throw new Error('User not authenticated. Please log in.');
      }
      
      // Determine content type
      const contentType = file.mimeType || 'application/octet-stream';
      
      // Upload with explicit options
      const { data, error } = await supabase.storage
        .from('materials')
        .upload(path, blob, {
          contentType: contentType,
          upsert: false,
          cacheControl: '3600',
        });
      
      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(error.message || 'Failed to upload file to storage');
      }
      
      return data;
    } catch (err: any) {
      console.error('Upload error:', err);
      throw new Error(err.message || 'File upload failed');
    }
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
  },

  async updateMaterialStatus(materialId: string, status: 'pending' | 'processing' | 'done' | 'failed') {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update({ processing_status: status })
        .eq('id', materialId)
        .select()
        .single();

      if (error) {
        console.error('Error updating material status:', error);
        throw error;
      }
      console.log(`Material ${materialId} status updated to ${status}:`, data);
      return data;
    } catch (err: any) {
      console.error('Failed to update material status:', err);
      throw err;
    }
  },
};
