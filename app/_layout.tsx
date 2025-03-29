import { Slot } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_700Bold, Poppins_500Medium } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_500Medium,
  });

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // ou algum loader
  }

  return (
    <ThemeProvider>
      {/* Comportamento automático com tema do sistema */}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Slot />
    </ThemeProvider>
  );
}
