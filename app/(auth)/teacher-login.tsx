import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/services/supabase';

export default function TeacherLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    const newErrors: any = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profile?.role === 'student') {
        throw new Error('Students must use the Student Login portal.');
      }

      router.replace('/(teacher)/dashboard');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-wrenly-background">
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow px-6 pt-16 pb-8" keyboardShouldPersistTaps="handled">
          
          <View className="items-center mb-12">
            <View className="w-20 h-20 rounded-2xl bg-wrenly-accent items-center justify-center mb-6 shadow-lg">
              <Text className="text-wrenly-text text-4xl font-bold">W</Text>
            </View>
            <Text className="text-3xl font-bold text-wrenly-text tracking-tight mb-2">Teacher Portal</Text>
            <Text className="text-sm text-wrenly-textSecondary text-center px-4">
              Wrenly AI Educator Access
            </Text>
          </View>

          <View className="bg-wrenly-surface rounded-[16px] border border-wrenly-border p-6 shadow-sm mb-6">
            <View className="mb-5">
              <Text className="text-sm font-semibold text-wrenly-text mb-2">Teacher Email</Text>
              <TextInput
                value={email}
                onChangeText={(text) => { setEmail(text); setErrors(e => ({ ...e, email: undefined })); }}
                placeholder="teacher@school.edu.ph"
                placeholderTextColor="#A0A0B0"
                keyboardType="email-address"
                autoCapitalize="none"
                className={`h-12 px-4 rounded-xl text-base text-wrenly-text bg-wrenly-background border ${errors.email ? 'border-wrenly-danger' : 'border-wrenly-border'}`}
              />
              {errors.email && <Text className="text-xs text-wrenly-danger mt-1">{errors.email}</Text>}
            </View>

            <View className="mb-8">
              <Text className="text-sm font-semibold text-wrenly-text mb-2">Password</Text>
              <View className="relative justify-center">
                <TextInput
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrors(e => ({ ...e, password: undefined })); }}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0A0B0"
                  secureTextEntry={!showPassword}
                  className={`h-12 pl-4 pr-12 rounded-xl text-base text-wrenly-text bg-wrenly-background border ${errors.password ? 'border-wrenly-danger' : 'border-wrenly-border'}`}
                />
                <TouchableOpacity 
                  className="absolute right-4"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text className="text-wrenly-accent text-sm font-bold">{showPassword ? 'HIDE' : 'SHOW'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-xs text-wrenly-danger mt-1">{errors.password}</Text>}
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`h-[48px] rounded-[12px] bg-wrenly-accent items-center justify-center ${loading ? 'opacity-70' : ''}`}
            >
              <Text className="text-wrenly-text font-bold text-base">{loading ? 'Login →' : 'Login →'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center py-4"
          >
            <Text className="text-sm text-wrenly-textSecondary">
              Are you a student? <Text className="text-wrenly-accent font-semibold">Back to Student Login</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
