export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface Material {
  id: string;
  classroom_id: string | null;
  teacher_id: string;
  title: string;
  file_type: string;
  storage_path: string;
  processing_status: ProcessingStatus;
  created_at: string;
  classrooms?: {
    name: string;
  };
}

export interface MaterialUploadData {
  classroom_id: string | null;
  teacher_id: string;
  title: string;
  file_type: string;
  storage_path: string;
  processing_status: ProcessingStatus;
}
