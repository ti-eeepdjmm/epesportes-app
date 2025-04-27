// app/callback.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { setTokens } from '@/utils/storage';
import api from '@/utils/api';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as LocalUser } from '@/types';

export default function Callback() {
  const { url: encodedUrl } = useLocalSearchParams<{ url?: string }>();
  const router = useRouter();
  const { signIn } = useAuth();

  useEffect(() => {
    async function handle() {
      if (!encodedUrl) {
        router.replace('/(auth)/login');
        return;
      }

      try {
        const fullUrl = decodeURIComponent(encodedUrl);
        const { params, errorCode } = QueryParams.getQueryParams(fullUrl);

        if (errorCode || !params.access_token || !params.refresh_token) {
          router.replace('/(auth)/login');
          return;
        }

        const { access_token, refresh_token, type } = params;

        // 1) Seta sessão no Supabase
        await supabase.auth.setSession({ access_token, refresh_token });

        // 2) Salva tokens localmente
        await setTokens({ accessToken: access_token, refreshToken: refresh_token });

        // 3) Pega dados do usuário no Supabase
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr || !user) throw userErr;


        // 4) Busca ou cria usuário na sua API
        const localUser = await getOrCreateLocalUser(user);

        // 5) Atualiza o contexto de autenticação
        await signIn(access_token, {
          id: localUser.id,
          authUserId: user.id,
          name: localUser.name,
          email: localUser.email,
          profilePhoto: localUser.profilePhoto ?? user.user_metadata.avatar_url,
          favoriteTeam: localUser.favoriteTeam,
          isAthlete: localUser.isAthlete,
          birthDate: localUser.birthDate,
          hasPasswordLogin: user.app_metadata.providers?.includes('email'),
          username: localUser.username,
          createdAt: localUser.createdAt,
        });

        // 6) Roteia para a tela correta
        if (type === 'recovery') {
          router.replace({ pathname: '/reset-password', params: { token: access_token } });
        } else if (type === 'signup') {
          router.replace({ pathname: '/success', params: { type: 'confirmation' } });
        } else {
          router.replace('/(tabs)');
        }
      } catch {
        router.replace('/(auth)/login');
      }
    }

    handle();
  }, [encodedUrl, router, signIn]);

  return null;
}

async function getOrCreateLocalUser(user: SupabaseUser): Promise<LocalUser> {
  if (!user.email) {
    throw new Error('User email is required');
  }

  try {
    // 1) Tenta buscar perfil existente
    const { data } = await api.get<LocalUser>(`/users/email/${user.email}`);
    return data;
  } catch (err: any) {
    // 2) Se 404, cria novo; senão, relança
    if (err.response?.status === 404) {
      const payload = {
        authUserId: user.id,
        name: user.user_metadata.full_name,
        email: user.email,
        favoriteTeamId: null,
        profilePhoto: user.user_metadata.avatar_url ?? null,
        username: null,
        isAthlete: false,
        birthDate: null,
      };
      const { data } = await api.post<LocalUser>('/users', payload);
      return data;
    }
    throw err;
  }
}
