import { useAuth } from '@/modules/security/useAuth';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useState } from 'react';
import { MaterialsRepository } from './materials.repository';

export function useMaterialUpload(classroomId?: string) {
  const { user } = useAuth();
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
      try {
        await MaterialsRepository.uploadFileToStorage(file, path);
      } catch (uploadErr: any) {
        console.error('Storage upload failed:', uploadErr);
        throw new Error(`File upload failed: ${uploadErr.message}`);
      }
      
      setUploadProgress(50);
      setProcessingStatus('Extracting text and analyzing content...');

      const materialType = ext === 'mp4' ? 'mp4' : ext === 'pptx' || ext === 'ppt' ? 'pptx' : ext === 'docx' || ext === 'doc' ? 'docx' : 'pdf';
      
      // For now we allow null classroom_id until a class is selected
      const material = await MaterialsRepository.createMaterialRecord({
        classroom_id: classroomId || null,
        teacher_id: user.id,
        title: file.name,
        file_type: materialType,
        storage_path: path,
        processing_status: 'processing'
      });

      setUploadProgress(70);
      
      // Simulate backend AI trigger taking time, then mark as done
      const updateStatusAfterDelay = async () => {
        try {
          await MaterialsRepository.updateMaterialStatus(material.id, 'done');
          console.log('Material status updated to done:', material.id);
          setUploadProgress(100);
          setProcessingStatus('Done! Lesson structure prepared.');
          // Refresh materials list to show updated status
          await new Promise(resolve => setTimeout(resolve, 500));
          await fetchRecent();
        } catch (err) {
          console.error('Failed to update material status:', err);
        }
      };

      setTimeout(updateStatusAfterDelay, 2500);

      // Also set up a cleanup timeout to reset UI
      setTimeout(() => {
        setIsUploading(false);
        setProcessingStatus(null);
        setUploadProgress(0);
      }, 6000);

      return { success: true };
    } catch (err: any) {
      setIsUploading(false);
      setProcessingStatus(null);
      console.error('Upload error:', err);
      return { error: err.message || 'Upload failed. Please check your connection and try again.' };
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
