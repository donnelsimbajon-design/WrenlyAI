import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { theme } from '@/config/theme';

export default function SplashScreen() {
  const router = useRouter();

  const handleRoleSelection = (role: 'teacher' | 'student') => {
    // Go to the registration form with the selected role
    router.push({ pathname: '/(auth)/register', params: { initialRole: role } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', paddingHorizontal: 24 }}>

      {/* Back to login */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 16 }}
      >
        <Feather name="arrow-left" size={20} color={theme.colors.wrenly.textSecondary} />
        <Text style={{ color: theme.colors.wrenly.textSecondary, marginLeft: 6, fontSize: 14 }}>Back to Login</Text>
      </TouchableOpacity>

      {/* Logo */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Image
          source={require('@/assets/images/logo-with-text.png')}
          style={{ width: 260, height: 90 }}
          resizeMode="contain"
        />
        <Text style={{ color: '#374151', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 24 }}>
          Join Wrenly AI
        </Text>
        <Text style={{ color: '#9CA3AF', fontSize: 15, textAlign: 'center', marginTop: 8 }}>
          Select your role to get started
        </Text>
      </View>

      {/* Role Cards */}
      <View style={{ width: '100%', gap: 16, paddingBottom: 40 }}>

        {/* Teacher Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleRoleSelection('teacher')}
          style={{
            backgroundColor: '#F0FAF8',
            borderRadius: 20,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: theme.colors.wrenly.primary + '40',
          }}
        >
          <View style={{
            width: 56, height: 56, borderRadius: 16,
            backgroundColor: theme.colors.wrenly.primary,
            alignItems: 'center', justifyContent: 'center', marginRight: 16
          }}>
            <MaterialCommunityIcons name="briefcase-variant" size={28} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1F2937' }}>I'm a Teacher</Text>
            <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>Register with your Teacher ID & email</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.colors.wrenly.textSecondary} />
        </TouchableOpacity>

        {/* Student Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleRoleSelection('student')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: '#E5E7EB',
          }}
        >
          <View style={{
            width: 56, height: 56, borderRadius: 16,
            backgroundColor: '#F3F4F6',
            alignItems: 'center', justifyContent: 'center', marginRight: 16
          }}>
            <MaterialCommunityIcons name="school" size={28} color={theme.colors.wrenly.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1F2937' }}>I'm a Student</Text>
            <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>Register with your LRN & school details</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.colors.wrenly.textSecondary} />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
