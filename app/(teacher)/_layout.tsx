import { Stack } from 'expo-router';

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ai-settings" />
      <Stack.Screen name="upload" />
    </Stack>
  );
}
