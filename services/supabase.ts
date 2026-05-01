import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
 * During server-side rendering (Expo Router web SSR), `window` is not defined
 * and AsyncStorage will crash. We use an in-memory no-op fallback for SSR,
 * and real AsyncStorage on the client side.
 */
const isSSR = typeof window === 'undefined';

const ssrSafeStorage = isSSR
  ? {
      getItem: (_key: string) => Promise.resolve(null),
      setItem: (_key: string, _value: string) => Promise.resolve(),
      removeItem: (_key: string) => Promise.resolve(),
    }
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ssrSafeStorage,
    autoRefreshToken: true,
    persistSession: !isSSR,
    detectSessionInUrl: false,
  },
});
