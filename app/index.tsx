// app/(root)/StartApp.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import api from '@/utils/api';
import {
  isUserRegistered,
  getAccessToken,
  clearTokens,
} from '../utils/storage';
import { useAuth } from '@/contexts/AuthContext';

export default function StartApp() {
  const { signOut } = useAuth();

  useEffect(() => {
    async function init() {
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
            router.replace('/(tabs)');
          } catch {
            await clearTokens();
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      } catch {
        await clearTokens();
        await signOut();
        router.replace('/(auth)/login');
      }
    }

    init();
  }, [signOut]);

  // tudo acontece atrás do SplashScreen, aqui é só “vazio”
  return null;
}
