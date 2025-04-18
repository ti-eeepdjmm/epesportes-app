import { Slot } from 'expo-router';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppLoader } from '@/components/AppLoader';
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()// for web browser auth session

SplashScreen.preventAutoHideAsync();// Prevent the splash screen from auto-hiding before the app is ready

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const colorScheme = useColorScheme() ?? 'light';

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

  return (
    <ThemeProvider>
      <AuthProvider>
        <RenderApp colorScheme={colorScheme} />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RenderApp({ colorScheme }: { colorScheme: 'light' | 'dark' }) {
  const { user } = useAuth();

  return (
    <SocketProvider userId={user?.id ?? ''}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Slot />
    </SocketProvider>
  );
}
