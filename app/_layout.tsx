// app/_layout.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { InteractionManager } from 'react-native';
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  initialRouteName: '(tabs)',
  modalRoutes: [
    '(modals)/notifications',
    '(modals)/polls/[pollId]',
    '(modals)/matches/[matchId]',
  ],
};

WebBrowser.maybeCompleteAuthSession();

// Prevenir auto-hide da splash screen com tratamento de erro aprimorado
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.error('Error preventing splash screen auto hide:', error);
});

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
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Fase 1: montar o Slot após 100ms e só iniciar bootstrap quando fontes estiverem prontas
  return <RenderApp fontsReady={fontsLoaded || !!fontError} />;
}

function RenderApp({ fontsReady }: { fontsReady: boolean }) {
  const { user, signOut } = useAuth();
  const theme = useThemeContext().theme === 'dark' ? '#000' : '#FFF';
  const router = useRouter();
  const url = Linking.useURL();
  const hasBootstrapped = useRef(false);
  const [navMounted, setNavMounted] = useState(false);

  // Fase 1: montar o Slot assim que interações/layout iniciais terminarem (melhor que delay fixo)
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setNavMounted(true);
    });
    return () => task.cancel && task.cancel();
  }, []);

  // Fase 2: executar bootstrap e navegação após Slot montado e fontes prontas
  useEffect(() => {
    if (!navMounted || !fontsReady || hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    (async () => {
      try {
        // Deep link inicial (callback)
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl?.includes('callback')) {
          router.replace({
            pathname: '/callback',
            params: { url: encodeURIComponent(initialUrl) },
          });
          return;
        }

        // Auth
        const token = await getAccessToken();
        const registered = await isUserRegistered();

        if (!token) {
          router.replace(registered ? '/(auth)/login' : '/(onboarding)/start');
        } else {
          try {
            await api.get('/auth/me');
            router.replace('/(tabs)');
          } catch {
            await clearTokens();
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      } catch (err) {
        console.error('Bootstrap error:', err);
        try {
          await clearTokens();
          await signOut();
          router.replace('/(auth)/login');
        } catch {}
      } finally {
        // Fase 3: ocultar splash após próxima batida de frame
        try {
          requestAnimationFrame(async () => {
            try {
              await SplashScreen.hideAsync();
            } catch (e) {
              console.error('Error hiding splash screen:', e);
            }
          });
        } catch (e) {
          console.error('RAF scheduling error:', e);
          try { await SplashScreen.hideAsync(); } catch {}
        }
      }
    })();
  }, [navMounted, fontsReady, router, signOut]);

  // Fallback: garantir que a splash jamais fique travada (12s)
  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 12000);
    return () => clearTimeout(t);
  }, []);

  // Deep links em runtime
  useEffect(() => {
    if (!url) return;
    (async () => {
      const cb = Linking.createURL('callback');
      if (url.startsWith(cb)) {
        router.replace({
          pathname: '/callback',
          params: { url: encodeURIComponent(url) },
        });
      }
    })();
  }, [url, router]);

  // Enquanto aguardamos Fase 1, manter a splash (não renderiza nada)
  if (!navMounted) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme }} edges={['top']}>
        <StatusBar style={theme === '#000' ? 'light' : 'dark'} />

        <SocketProvider userId={user?.id ?? 0}>
          <NotificationProvider>
            <Slot />
          </NotificationProvider>
        </SocketProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}


