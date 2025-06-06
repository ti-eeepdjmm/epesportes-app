// app/_layout.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

import api from '@/utils/api';
import { getAccessToken, isUserRegistered, clearTokens } from '@/utils/storage';

export const unstable_settings = {
  initialRouteName: '(tabs)',
  modalRoutes: [
    '(modals)/notifications',
    '(modals)/polls/[pollId]',
    '(modals)/matches/[matchId]',
  ],
};

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync().catch(console.warn);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppEntry />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppEntry() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [bootstrapped, setBootstrapped] = useState(false);
  const hasBootstrapped = useRef(false);
  const router = useRouter();
  const segments = useSegments();
  const { signOut } = useAuth();

  const onLayoutRootView = useCallback(async () => {
    if (hasBootstrapped.current || !fontsLoaded) return;
    hasBootstrapped.current = true;

    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl?.includes('callback')) {
        router.replace({
          pathname: '/callback',
          params: { url: encodeURIComponent(initialUrl) },
        });
        return;
      }

      const token = await getAccessToken();
      const registered = await isUserRegistered();

      if (!token) {
        router.replace(registered ? '/(auth)/login' : '/(onboarding)/start');
      } else {
        try {
          await api.get('/auth/me');
          if (segments[0] !== '(tabs)') {
            router.replace('/(tabs)');
          }
        } catch {
          await clearTokens();
          await signOut();
          router.replace('/(auth)/login');
        }
      }
    } catch (err) {
      console.error('Bootstrap error:', err);
      await clearTokens();
      await signOut();
      router.replace('/(auth)/login');
    } finally {
      setBootstrapped(true);
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, segments]);

  return <RenderApp onLayout={onLayoutRootView} />;
}

function RenderApp({ onLayout }: { onLayout: () => void }) {
  const { user } = useAuth();
  const theme = useThemeContext().theme === 'dark' ? '#000' : '#FFF';
  const router = useRouter();
  const url = Linking.useURL();

  useEffect(() => {
    (async () => {
      const incoming = url ?? (await Linking.getInitialURL());
      if (!incoming) return;
      const cb = Linking.createURL('callback');
      if (incoming.startsWith(cb)) {
        router.replace({
          pathname: '/callback',
          params: { url: encodeURIComponent(incoming) },
        });
      }
    })();
  }, [url, router]);

  return (
    <SocketProvider userId={user?.authUserId ?? ''}>
      <NotificationProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme }}
          onLayout={onLayout}
        >
          <StatusBar style={theme === '#000' ? 'light' : 'dark'} />
          <Slot />
        </SafeAreaView>
      </NotificationProvider>
    </SocketProvider>
  );
}
