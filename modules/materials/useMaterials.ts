import { create } from 'zustand';
import { Material, ProcessingStatus } from '@/types/materials.types';
import { MaterialsService } from './materials.service';

interface MaterialsState {
  materials: Material[];
  currentMaterial: Material | null;
  isLoading: boolean;
  error: string | null;

  fetchMaterials: (classroomId: string) => Promise<void>;
  fetchMaterial: (id: string) => Promise<void>;
  updateMaterialStatus: (id: string, status: ProcessingStatus) => Promise<void>;
  deleteMaterial: (id: string, storagePath: string) => Promise<void>;
  clearError: () => void;
  clearCurrent: () => void;
}

export const useMaterials = create<MaterialsState>((set, get) => ({
  materials: [],
  currentMaterial: null,
  isLoading: false,
  error: null,

  fetchMaterials: async (classroomId) => {
    set({ isLoading: true, error: null });
    try {
      const materials = await MaterialsService.getMaterials(classroomId);
      set({ materials });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMaterial: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const material = await MaterialsService.getMaterialById(id);
      set({ currentMaterial: material });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateMaterialStatus: async (id, status) => {
    try {
      const updated = await MaterialsService.updateMaterialStatus(id, status);
      set((state) => ({
        materials: state.materials.map(m => m.id === id ? { ...m, processing_status: status } : m),
        currentMaterial: state.currentMaterial?.id === id ? { ...state.currentMaterial, processing_status: status } : state.currentMaterial
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteMaterial: async (id, storagePath) => {
    set({ isLoading: true, error: null });
    try {
      await MaterialsService.deleteMaterial(id, storagePath);
      set((state) => ({
        materials: state.materials.filter(m => m.id !== id),
        currentMaterial: state.currentMaterial?.id === id ? null : state.currentMaterial
      }));
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  clearCurrent: () => set({ currentMaterial: null })
}));
