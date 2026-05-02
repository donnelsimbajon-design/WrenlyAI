import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';

export default function StudentLoginScreen() {
  const [lrn, setLrn] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ lrn?: string; password?: string; consent?: string }>({});

  const handleLogin = async () => {
    const newErrors: any = {};
    if (!lrn || lrn.length !== 12) newErrors.lrn = 'Please enter a valid 12-digit LRN';
    if (!password) newErrors.password = 'Password is required';
    if (!parentalConsent) newErrors.consent = 'Parental consent is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // In this example, LRN is used as email prefix for student login: {lrn}@student.wrenly.ai
      const email = `${lrn}@student.wrenly.ai`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Ensure role is student
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profile?.role === 'teacher') {
        throw new Error('Please use the Teacher Login portal.');
      }

      router.replace('/(student)/dashboard');
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
            <View className="w-20 h-20 rounded-2xl bg-wrenly-primary items-center justify-center mb-6 shadow-lg">
              <Text className="text-wrenly-text text-4xl font-bold">W</Text>
            </View>
            <Text className="text-3xl font-bold text-wrenly-text tracking-tight mb-2">Wrenly AI</Text>
            <Text className="text-sm text-wrenly-textSecondary text-center px-4">
              Empowering students through intelligent learning
            </Text>
          </View>

          <View className="bg-wrenly-surface rounded-[16px] border border-wrenly-border p-6 shadow-sm mb-6">
            <View className="mb-5">
              <Text className="text-sm font-semibold text-wrenly-text mb-2">Student LRN (12 Digits)</Text>
              <TextInput
                value={lrn}
                onChangeText={(text) => { setLrn(text); setErrors(e => ({ ...e, lrn: undefined })); }}
                placeholder="000000000000"
                placeholderTextColor="#A0A0B0"
                keyboardType="numeric"
                maxLength={12}
                className={`h-12 px-4 rounded-xl text-base text-wrenly-text bg-wrenly-background border ${errors.lrn ? 'border-wrenly-danger' : 'border-wrenly-border'}`}
              />
              {errors.lrn && <Text className="text-xs text-wrenly-danger mt-1">{errors.lrn}</Text>}
            </View>

            <View className="mb-5">
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
                  <Text className="text-wrenly-primary text-sm font-bold">{showPassword ? 'HIDE' : 'SHOW'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-xs text-wrenly-danger mt-1">{errors.password}</Text>}
            </View>

            <Pressable
              onPress={() => { setParentalConsent(!parentalConsent); setErrors(e => ({ ...e, consent: undefined })); }}
              className="flex-row items-start mt-2 mb-6"
            >
              <View className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${parentalConsent ? 'bg-wrenly-primary border-wrenly-primary' : errors.consent ? 'border-wrenly-danger bg-wrenly-background' : 'border-wrenly-textSecondary bg-wrenly-background'}`}>
                {parentalConsent && <Text className="text-wrenly-text text-xs font-bold leading-none">✓</Text>}
              </View>
              <View className="flex-1">
                <Text className="text-sm text-wrenly-textSecondary leading-5">
                  I have parental consent and agree to the <Text className="text-wrenly-primary underline">Privacy Policy and learning guidelines</Text>.
                </Text>
                {errors.consent && <Text className="text-xs text-wrenly-danger mt-1">{errors.consent}</Text>}
              </View>
            </Pressable>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`h-[48px] rounded-[12px] bg-wrenly-primary items-center justify-center ${loading ? 'opacity-70' : ''}`}
            >
              <Text className="text-wrenly-text font-bold text-base">{loading ? 'Logging in...' : 'Login →'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/teacher-login')}
            className="items-center py-4"
          >
            <Text className="text-sm text-wrenly-textSecondary">
              Are you an educator? <Text className="text-wrenly-primary font-semibold">Teacher Login</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
