import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/modules/security/useAuth';
import { StudentDashboardRepository } from './studentDashboard.repository';
import { useNetworkStatus } from '@/utils/network';

export function useStudentDashboard() {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // If offline, we could try SQLite here later for Phase 8
      if (isOnline) {
        const classes = await StudentDashboardRepository.getEnrolledClassrooms(user.id);
        const validClasses = classes.filter(c => c !== null); // safety
        setClassrooms(validClasses);
        
        const classIds = validClasses.map((c: any) => c.id);
        const anns = await StudentDashboardRepository.getRecentAnnouncements(classIds);
        setAnnouncements(anns);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isOnline]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const joinClass = async (classCode: string) => {
    if (!user?.id) return { error: 'Not authenticated' };
    if (!isOnline) return { error: 'Must be online to join a class' };
    
    setIsJoining(true);
    try {
      await StudentDashboardRepository.joinClass(user.id, classCode);
      await fetchData(); // Refresh data
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setIsJoining(false);
    }
  };

  return {
    classrooms,
    announcements,
    isLoading,
    isJoining,
    error,
    joinClass,
    refresh: fetchData,
  };
}
