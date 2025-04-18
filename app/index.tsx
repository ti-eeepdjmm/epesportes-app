// app/(root)/StartApp.tsx
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { AppLoader } from '@/components/AppLoader';

import {
  isUserRegistered,
  getAccessToken,
  clearTokens,
} from '../utils/storage';

export default function StartApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const token = await getAccessToken();
        const registered = await isUserRegistered();

        if (token) {
          // opcional: validar token no servidor aqui
          router.replace('/(tabs)');
        }
        else if (!registered) {
          router.replace('/(onboarding)/start');
        }
        else {
          router.replace('/(auth)/login');
        }
      } catch (err) {
        console.error('Erro no fluxo de início:', err);
        await clearTokens();
        router.replace('/(auth)/login');
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  return loading
    ? <AppLoader visible />
    : null;
}
