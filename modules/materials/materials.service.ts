import { supabase } from '@/services/supabase';

import { Material, MaterialUploadData, ProcessingStatus } from '@/types/materials.types';

export const MaterialsService = {
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

  async createMaterialRecord(materialData: MaterialUploadData) {
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

  async getMaterials(classroomId: string) {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Material[];
  },

  async getMaterialById(id: string) {
    const { data, error } = await supabase
      .from('materials')
      .select('*, classrooms(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Material;
  },

  async updateMaterialStatus(id: string, status: ProcessingStatus) {
    const { data, error } = await supabase
      .from('materials')
      .update({ processing_status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Material;
  },

  async deleteMaterial(id: string, storagePath: string) {
    // 1. Delete from storage if path exists
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('materials')
        .remove([storagePath]);
      
      if (storageError) {
        console.error('Failed to delete file from storage', storageError);
        // Continue to delete the DB record anyway
      }
    }

    // 2. Delete from DB
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
