import { supabase } from '@/services/supabase';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function StudentLoginScreen() {
  const [lrn, setLrn] = useState('123456789012');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(true);
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

    // TEMPORARY DEVELOPMENT BYPASS
    if (lrn === '123456789012' && password === 'password123') {
      router.replace('/(student)/dashboard');
      setLoading(false);
      return;
    }

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F9F9' }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View className="items-center mb-6">
            <Image source={require('@/assets/images/logo-with-text.png')} style={{ width: 380, height: 130, marginBottom: 4, resizeMode: 'contain' }} />
            <Text style={{ color: '#6A7A82', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 }}>
              Empowering students through intelligent learning
            </Text>
          </View>

          {/* Main Card */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, paddingBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, marginBottom: 32 }}>
            
            {/* LRN Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#566B80', marginBottom: 8, letterSpacing: 0.5 }}>STUDENT LRN (LEARNER REFERENCE NUMBER)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, backgroundColor: '#FCFDFD', borderWidth: 1, borderColor: errors.lrn ? '#FF4757' : '#E2E8F0', borderRadius: 8, paddingHorizontal: 12 }}>
                <FontAwesome5 name="id-badge" size={16} color="#8A9BA8" style={{ marginRight: 10 }} />
                <TextInput
                  value={lrn}
                  onChangeText={(text) => { setLrn(text); setErrors(e => ({ ...e, lrn: undefined })); }}
                  placeholder="Enter your 12-digit LRN"
                  placeholderTextColor="#A0AEBA"
                  keyboardType="numeric"
                  maxLength={12}
                  style={{ flex: 1, fontSize: 14, color: '#2C3E50' }}
                />
              </View>
              {errors.lrn && <Text style={{ fontSize: 12, color: '#FF4757', marginTop: 4 }}>{errors.lrn}</Text>}
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#566B80', marginBottom: 8, letterSpacing: 0.5 }}>PASSWORD</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, backgroundColor: '#FCFDFD', borderWidth: 1, borderColor: errors.password ? '#FF4757' : '#E2E8F0', borderRadius: 8, paddingHorizontal: 12 }}>
                <FontAwesome5 name="lock" size={14} color="#8A9BA8" style={{ marginRight: 10 }} />
                <TextInput
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrors(e => ({ ...e, password: undefined })); }}
                  placeholder="••••••••"
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

            {/* Checkbox */}
            <Pressable
              onPress={() => { setParentalConsent(!parentalConsent); setErrors(e => ({ ...e, consent: undefined })); }}
              style={{ backgroundColor: '#F2F6F6', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 }}
            >
              <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: parentalConsent ? '#00665E' : '#CBD5E1', backgroundColor: parentalConsent ? '#00665E' : '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 }}>
                {parentalConsent && <FontAwesome5 name="check" size={10} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#566B80', lineHeight: 18 }}>
                  I confirm I have my parent/guardian's consent to access Wrenly AI. I agree to the <Text style={{ color: '#00665E', fontWeight: '700' }}>Privacy Policy</Text> and learning guidelines.
                </Text>
                {errors.consent && <Text style={{ fontSize: 12, color: '#FF4757', marginTop: 4 }}>{errors.consent}</Text>}
              </View>
            </Pressable>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{ height: 48, backgroundColor: '#00665E', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1, marginBottom: 24 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15, marginRight: 8 }}>{loading ? 'Logging in...' : 'Login'}</Text>
              {!loading && <Feather name="arrow-right" size={18} color="#FFFFFF" />}
            </TouchableOpacity>

            {/* Teacher Login Link */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#F0F2F5', paddingTop: 20, paddingBottom: 4, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => router.push('/(auth)/teacher-login')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome5 name="graduation-cap" size={14} color="#6A7A82" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 12, color: '#6A7A82', fontWeight: '600' }}>Teacher Login</Text>
              </TouchableOpacity>
            </View>

            {/* Help text */}
            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#8A9BA8' }}>
                Need help? <Text style={{ color: '#00665E', fontWeight: '700' }}>Contact school IT</Text>
              </Text>
            </View>
          </View>

          {/* Bottom Icons */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 'auto' }}>
            <View style={{ width: 68, height: 68, backgroundColor: '#EBF1F2', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="sparkles" size={24} color="#8A9BA8" />
            </View>
            <View style={{ width: 68, height: 68, backgroundColor: '#EBF1F2', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="head-cog" size={26} color="#00665E" />
            </View>
            <View style={{ width: 68, height: 68, backgroundColor: '#EBF1F2', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesome5 name="book-open" size={20} color="#8A9BA8" />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
