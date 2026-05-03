import { Stack, router } from 'expo-router';
import { useAuth } from '@/modules/security/useAuth';
import { useEffect } from 'react';

export default function TeacherLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="ai-settings" />
      <Stack.Screen name="classroom/create" />
      <Stack.Screen name="classroom/[id]" />
    </Stack>
  );
}
