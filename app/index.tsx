import { Redirect } from 'expo-router';
import { useAuth } from '@/modules/security/useAuth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, session } = useAuth();

  // If we are still determining the auth state (you might need an isLoading in authStore, but for now we just check session)
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect based on role
  if (user?.role === 'teacher') {
    return <Redirect href="/(teacher)/upload" />;
  } else {
    // Default to student dashboard
    return <Redirect href="/(student)/dashboard" />;
  }
}
