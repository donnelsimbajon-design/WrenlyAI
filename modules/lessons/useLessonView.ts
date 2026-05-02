import { useState, useEffect, useCallback } from 'react';
import * as Speech from 'expo-speech';
import { useNetworkStatus } from '@/utils/network';
import { LessonRepository } from './lesson.repository';

export type LanguageMode = 'en' | 'tl' | 'ceb';

export function useLessonView(lessonId: string) {
  const { isOnline } = useNetworkStatus();
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [language, setLanguage] = useState<LanguageMode>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0); // For UI mock of progress

  const fetchLesson = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isOnline) {
        const data = await LessonRepository.getLessonById(lessonId);
        setLesson(data);
      } else {
        // Fallback to SQLite (Placeholder for Phase 8)
        const data = await LessonRepository.getLessonByIdOffline(lessonId);
        setLesson(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, isOnline]);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
    // Cleanup speech when unmounting
    return () => {
      Speech.stop();
    };
  }, [fetchLesson, lessonId]);

  const toggleLanguage = (lang: LanguageMode) => {
    setLanguage(lang);
    if (isPlaying) {
      stopAudio(); // Stop speech if playing when changing language
    }
  };

  const getLanguageTag = (lang: LanguageMode) => {
    switch (lang) {
      case 'tl': return 'fil-PH'; // Tagalog/Filipino
      case 'ceb': return 'fil-PH'; // Fallback for Cebuano if TTS doesn't have it natively
      case 'en': default: return 'en-US';
    }
  };

  const playAudio = async () => {
    if (!lesson) return;
    
    let contentToRead = '';
    if (language === 'en') contentToRead = lesson.content_en;
    else if (language === 'tl') contentToRead = lesson.content_tl;
    else if (language === 'ceb') contentToRead = lesson.content_ceb;

    if (!contentToRead) return;

    setIsPlaying(true);
    setPlaybackPosition(0);

    const voiceLang = getLanguageTag(language);

    Speech.speak(contentToRead, {
      language: voiceLang,
      pitch: 1.0,
      rate: 0.9, // Slightly slower for students
      onDone: () => {
        setIsPlaying(false);
        setPlaybackPosition(100);
      },
      onStopped: () => {
        setIsPlaying(false);
      },
    });
  };

  const stopAudio = () => {
    Speech.stop();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) stopAudio();
    else playAudio();
  };

  return {
    lesson,
    isLoading,
    error,
    isOnline,
    language,
    toggleLanguage,
    isPlaying,
    togglePlay,
    playbackPosition
  };
}
