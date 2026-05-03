import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Wrenly AI] Missing Supabase environment variables.\n' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

/**
 * SSR-safe storage adapter.
 * - During SSR (window is undefined): returns no-op stubs so the server doesn't crash.
 * - On native (iOS/Android): uses AsyncStorage.
 * - On client-side web: uses localStorage directly (window IS defined).
 */
const isBrowser = typeof window !== 'undefined';
const isNative = Platform.OS !== 'web';

const getStorage = () => {
  // SSR environment — return no-op stubs
  if (!isBrowser && !isNative) {
    return {
      getItem: (_key: string) => Promise.resolve(null),
      setItem: (_key: string, _value: string) => Promise.resolve(),
      removeItem: (_key: string) => Promise.resolve(),
    };
  }

  // Native (iOS / Android) — use AsyncStorage dynamically to avoid SSR issues
  if (isNative) {
    // Dynamic require so it is never evaluated during SSR
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  }

  // Client-side web — use localStorage (no SSR crash risk here)
  return {
    getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
    setItem: (key: string, value: string) => {
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    },
  };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: isBrowser || isNative,
    detectSessionInUrl: false,
  },
});
