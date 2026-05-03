import { Stack, router } from 'expo-router';
import { useAuth } from '@/modules/security/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '@/config/theme';
import { useEffect } from 'react';

export default function AuthLayout() {
  const { isAuthenticated, role, isLoading, hasSeenWelcome } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (!hasSeenWelcome) {
        router.replace('/welcome');
        return;
      }

      if (role === 'teacher') {
        router.replace('/(teacher)/dashboard');
      } else {
        router.replace('/(student)/dashboard');
      }
    }
  }, [isAuthenticated, role, isLoading, hasSeenWelcome]);

  // If we are still checking the session, show a loader
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.wrenly.background }}>
        <ActivityIndicator size="large" color={theme.colors.wrenly.primary} />
      </View>
    );
  }

  // If logged in, we return null while the useEffect handles navigation
  if (isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
