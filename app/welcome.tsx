import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/modules/security/useAuth';
import { theme } from '@/config/theme';

const MESSAGES = [
  'I will be your AI assistant for your studies.',
  'I will help you understand lessons better.',
  'I will guide you through every difficulty.',
  'I am your personal online tutor — anytime.',
];

const REDIRECT_DELAY = 5000; // 5 seconds total

export default function WelcomeScreen() {
  const router = useRouter();
  const { role, completeWelcome } = useAuth();

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const dotScale1 = useRef(new Animated.Value(1)).current;
  const dotScale2 = useRef(new Animated.Value(1)).current;
  const dotScale3 = useRef(new Animated.Value(1)).current;

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Sequence: logo pops in → title fades in → card slides up
    Animated.sequence([
      // Logo bounce in
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 120 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Title fade + slide
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      // Card fade + slide
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cardTranslateY, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();

    // Rotating dot animation
    const animateDots = () => {
      const makeDot = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: 1.6, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(600),
          ])
        );

      Animated.parallel([
        makeDot(dotScale1, 0),
        makeDot(dotScale2, 200),
        makeDot(dotScale3, 400),
      ]).start();
    };
    animateDots();

    // Cycle through AI messages every 1.4 seconds
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1400);

    // Auto-redirect after delay
    const timer = setTimeout(async () => {
      clearInterval(msgInterval);
      await completeWelcome();
      if (role === 'teacher') {
        router.replace('/(teacher)/dashboard');
      } else {
        router.replace('/(student)/dashboard');
      }
    }, REDIRECT_DELAY);

    return () => {
      clearTimeout(timer);
      clearInterval(msgInterval);
    };
  }, []);

  const dotStyle = (scale: Animated.Value) => ({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.wrenly.primary,
    marginHorizontal: 4,
    transform: [{ scale }],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>

        {/* Logo with pop-in animation */}
        <Animated.View style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
          marginBottom: 28,
        }}>
          <Image
            source={require('@/assets/images/logo-with-text.png')}
            style={{ width: 280, height: 100 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Welcome title */}
        <Animated.View style={{
          opacity: titleOpacity,
          transform: [{ translateY: titleTranslateY }],
          marginBottom: 28,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.colors.wrenly.primary,
            textAlign: 'center',
            letterSpacing: -0.5,
          }}>
            Welcome to WrenlyAI
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#9CA3AF',
            marginTop: 6,
            textAlign: 'center',
          }}>
            Your personal AI-powered learning companion
          </Text>
        </Animated.View>

        {/* Message card */}
        <Animated.View style={{
          opacity: cardOpacity,
          transform: [{ translateY: cardTranslateY }],
          width: '100%',
          backgroundColor: '#F0FAF8',
          borderRadius: 24,
          padding: 24,
          borderWidth: 1,
          borderColor: theme.colors.wrenly.primary + '30',
          marginBottom: 48,
          minHeight: 110,
          justifyContent: 'center',
        }}>
          {/* Bird icon accent */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Image
              source={require('@/assets/images/bird-logo.png')}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
            <Text style={{ color: theme.colors.wrenly.primary, fontWeight: 'bold', marginLeft: 8, fontSize: 13 }}>
              Wrenly says...
            </Text>
          </View>

          <Text style={{
            fontSize: 16,
            color: '#374151',
            lineHeight: 26,
            fontWeight: '500',
          }}>
            "{MESSAGES[messageIndex]}"
          </Text>
        </Animated.View>

        {/* Bouncing dots loader */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Animated.View style={dotStyle(dotScale1)} />
          <Animated.View style={dotStyle(dotScale2)} />
          <Animated.View style={dotStyle(dotScale3)} />
        </View>

        <Text style={{
          color: '#D1D5DB',
          fontSize: 12,
          marginTop: 16,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>
          Setting up your experience...
        </Text>

      </View>
    </SafeAreaView>
  );
}
