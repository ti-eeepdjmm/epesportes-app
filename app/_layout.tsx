import React, { useEffect, useCallback } from 'react';
import { Slot, useRouter } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { AppLoader } from '@/components/AppLoader';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

// Completa sessões de autenticação web
WebBrowser.maybeCompleteAuthSession();

// Previna o auto-hide da splash até que o app esteja pronto
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

  const colorScheme = useThemeContext().theme ?? 'dark';

  const onReady = useCallback(async () => {
    if (fontsLoaded) {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Erro ao esconder SplashScreen:', error);
      }
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  if (!fontsLoaded) {
    return <AppLoader visible />;
  }

  return <RenderApp colorScheme={colorScheme} />;
}

function RenderApp({ colorScheme }: { colorScheme: 'light' | 'dark' }) {
  const { user } = useAuth();
  useDeepLinkRedirect();

  return (
    <SocketProvider userId={user?.authUserId ?? ''}>
      <NotificationProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Slot />
        </SafeAreaView>
      </NotificationProvider>
    </SocketProvider>
  );
}

function useDeepLinkRedirect() {
  const router = useRouter();
  const url = Linking.useURL();

  useEffect(() => {
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      const incoming = url ?? initialUrl;
      if (!incoming) return;

      const callbackUrl = Linking.createURL('callback');
      if (incoming.startsWith(callbackUrl)) {
        router.replace({
          pathname: '/callback',
          params: { url: encodeURIComponent(incoming) },
        });
      }
    })();
  }, [url]);
}
