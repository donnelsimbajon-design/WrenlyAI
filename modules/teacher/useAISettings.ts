import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { TeacherSettingsRepository, AISettings } from './teacherSettings.repository';
import { Alert } from 'react-native';

export function useAISettings() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<AISettings>({
    target_grade_level: 7,
    auto_generate_quiz: true,
    enable_tl: true,
    enable_ceb: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await TeacherSettingsRepository.getSettings(user.id);
      if (data) {
        setSettings({
          target_grade_level: data.target_grade_level,
          auto_generate_quiz: data.auto_generate_quiz,
          enable_tl: data.enable_tl,
          enable_ceb: data.enable_ceb
        });
        setLastUpdated(data.updated_at || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const savedData = await TeacherSettingsRepository.saveSettings(user.id, settings);
      setLastUpdated(savedData.updated_at);
      Alert.alert('Settings Saved', 'Your AI Co-Pilot preferences have been successfully updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    fetchSettings();
  };

  return {
    settings,
    updateSetting,
    isLoading,
    isSaving,
    lastUpdated,
    saveSettings,
    discardChanges
  };
}
