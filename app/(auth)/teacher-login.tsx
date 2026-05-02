import { supabase } from '@/services/supabase';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Feather } from '@expo/vector-icons';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Image source={require('@/assets/images/logo-with-text.png')} style={{ width: 340, height: 110, marginBottom: 12, resizeMode: 'contain' }} />
            <Text style={{ color: '#2C3E50', fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 }}>Teacher Portal</Text>
            <Text style={{ color: '#6A7A82', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 }}>
              Wrenly AI Educator Access
            </Text>
          </View>

          {/* Main Card */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, paddingBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, marginBottom: 32 }}>
            
            {/* Email Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#566B80', marginBottom: 8, letterSpacing: 0.5 }}>TEACHER EMAIL</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, backgroundColor: '#FCFDFD', borderWidth: 1, borderColor: errors.email ? '#FF4757' : '#E2E8F0', borderRadius: 8, paddingHorizontal: 12 }}>
                <Feather name="mail" size={16} color="#8A9BA8" style={{ marginRight: 10 }} />
                <TextInput
                  value={email}
                  onChangeText={(text) => { setEmail(text); setErrors(e => ({ ...e, email: undefined })); }}
                  placeholder="teacher@school.edu.ph"
                  placeholderTextColor="#A0AEBA"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ flex: 1, fontSize: 14, color: '#2C3E50' }}
                />
              </View>
              {errors.email && <Text style={{ fontSize: 12, color: '#FF4757', marginTop: 4 }}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#566B80', marginBottom: 8, letterSpacing: 0.5 }}>PASSWORD</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, backgroundColor: '#FCFDFD', borderWidth: 1, borderColor: errors.password ? '#FF4757' : '#E2E8F0', borderRadius: 8, paddingHorizontal: 12 }}>
                <FontAwesome5 name="lock" size={14} color="#8A9BA8" style={{ marginRight: 10 }} />
                <TextInput
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrors(e => ({ ...e, password: undefined })); }}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0AEBA"
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, fontSize: 14, color: '#2C3E50' }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <FontAwesome5 name={showPassword ? "eye-slash" : "eye"} size={16} color="#8A9BA8" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={{ fontSize: 12, color: '#FF4757', marginTop: 4 }}>{errors.password}</Text>}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{ height: 48, backgroundColor: '#00665E', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1, marginBottom: 24 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15, marginRight: 8 }}>{loading ? 'Logging in...' : 'Login'}</Text>
              {!loading && <Feather name="arrow-right" size={18} color="#FFFFFF" />}
            </TouchableOpacity>

            {/* Student Login Link */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#F0F2F5', paddingTop: 20, paddingBottom: 4, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome5 name="user-graduate" size={14} color="#6A7A82" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 12, color: '#6A7A82', fontWeight: '600' }}>Back to Student Login</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
