import { useState, useCallback, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from '@/store/authStore';
import { MaterialsRepository } from './materials.repository';

export function useMaterialUpload(classroomId?: string) {
  const { user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);

  const fetchRecent = useCallback(async () => {
    if (!user?.id) return;
    try {
      const materials = await MaterialsRepository.getRecentMaterials(user.id);
      setRecentMaterials(materials);
    } catch (err) {
      console.error('Failed to fetch materials', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  const pickAndUpload = async () => {
    if (!user?.id) return { error: 'Not authenticated' };
    
    // Pick file
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf', 
        'application/vnd.ms-powerpoint', 
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      copyToCacheDirectory: true
    });

    if (result.canceled || !result.assets?.[0]) return { canceled: true };
    
    const file = result.assets[0];
    
    // Check size (150MB max)
    if (file.size && file.size > 150 * 1024 * 1024) {
      return { error: 'File size exceeds 150MB limit' };
    }

    setIsUploading(true);
    setUploadProgress(10);
    setProcessingStatus('Uploading file to storage...');

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const path = `${user.id}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      // Upload to Storage
      await MaterialsRepository.uploadFileToStorage(file, path);
      
      setUploadProgress(50);
      setProcessingStatus('Extracting text and analyzing content...');

      const materialType = ext === 'mp4' ? 'mp4' : ext === 'pptx' || ext === 'ppt' ? 'pptx' : ext === 'docx' || ext === 'doc' ? 'docx' : 'pdf';
      
      // For now we allow null classroom_id until a class is selected
      await MaterialsRepository.createMaterialRecord({
        classroom_id: classroomId || null,
        teacher_id: user.id,
        title: file.name,
        file_type: materialType,
        storage_path: path,
        processing_status: 'processing'
      });

      setUploadProgress(70);
      
      // Simulate backend AI trigger taking time
      setTimeout(() => {
        setUploadProgress(100);
        setProcessingStatus('Done! Lesson structure prepared.');
        fetchRecent();
        setTimeout(() => {
          setIsUploading(false);
          setProcessingStatus(null);
          setUploadProgress(0);
        }, 3000);
      }, 2500);

      return { success: true };
    } catch (err: any) {
      setIsUploading(false);
      setProcessingStatus(null);
      return { error: err.message };
    }
  };

  return {
    isUploading,
    uploadProgress,
    processingStatus,
    recentMaterials,
    pickAndUpload
  };
}
