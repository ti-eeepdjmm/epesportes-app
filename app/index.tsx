// app/(root)/StartApp.tsx
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { AppLoader } from '@/components/AppLoader';
import api from '@/utils/api';

import {
  isUserRegistered,
  getAccessToken,
  clearTokens,
} from '../utils/storage';

import { useAuth } from '@/contexts/AuthContext';

export default function StartApp() {
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  useEffect(() => {
    async function init() {
      try {
        // 1) Cold‑start: trata deep link 'callback'
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const { path, queryParams } = Linking.parse(initialUrl);
          if (path === 'callback') {
            const { access_token, refresh_token, type } = queryParams as {
              access_token?: string;
              refresh_token?: string;
              type?: 'signup' | 'recovery' | 'oauth';
            };

            router.replace({
              pathname: '/callback',
              params: {
                access_token: access_token!,
                refresh_token: refresh_token!,
                type: type!,
              },
            });
            return;
          }
        }

        // 2) Sem deep link: fluxo normal
        const token = await getAccessToken();
        const registered = await isUserRegistered();
       

        if (!token) {
          // sem token: decide entre onboarding ou login
          if (!registered) router.replace('/(onboarding)/start');
          else router.replace('/(auth)/login');
        } else {
          // com token: valida sessão no servidor via /auth/me
          try {
            await api.get('/auth/me'); 
            router.replace('/(tabs)');
          } catch (error) {
            console.warn('Token inválido ou expirado, fazendo logout:', error);
            // limpa storage e context
            await clearTokens();
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      } catch (err: unknown) {
        console.error('Erro no fluxo de início:', err);
        await clearTokens();
        await signOut();
        router.replace('/(auth)/login');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [signOut]);

  return loading ? <AppLoader visible /> : null;
}
