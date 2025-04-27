// app/callback.tsx
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { setTokens } from '@/utils/storage'
import api from '@/utils/api'
import { User } from '@supabase/supabase-js'
import { User as LocalUser } from '@/types'

export default function Callback() {
  const { url: encodedUrl } =
    useLocalSearchParams<{ url?: string }>()
  const router = useRouter()
  const { signIn } = useAuth()

  useEffect(() => {
    if (!encodedUrl) return
    const fullUrl = decodeURIComponent(encodedUrl)

    // extrai tanto query ?type=… quanto fragment #access_token=…&…
    const { params, errorCode } = QueryParams.getQueryParams(fullUrl)
    if (errorCode || !params.access_token || !params.refresh_token) {
      console.error('Erro ao parsear deep link:', errorCode)
      router.replace('/(auth)/login')
      return
    }

    const { access_token, refresh_token, type } = params
    // seta a sessão completa
    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(async () => {
        // salva os tokens no AsyncStorage
        await setTokens({
          accessToken: access_token,
          refreshToken: refresh_token,
        })
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser()
        if (userErr || !user) throw userErr

        //verifica se o usuário já existe na API
        // se não existe, cria um registro parcial
        const localUser = await getOrCreateLocalUser(user);
        
        // salva no seu contexto
        await signIn(access_token, {
          id: localUser.id,
          authUserId: user.id,
          name: localUser.name,
          email: localUser.email,
          profilePhoto: localUser.profilePhoto || user.user_metadata.avatar_url,
          favoriteTeam: localUser.favoriteTeam,
          isAthlete: localUser.isAthlete,
          birthDate: localUser.birthDate,
          hasPasswordLogin: user?.app_metadata.providers?.includes('email'),
          username: localUser.username,
          createdAt: localUser.createdAt,
        })

        // finalmente, roteia pra tela certa
        if (type === 'recovery') {
          router.replace({ pathname: '/reset-password', params: { token: access_token } })
        } else if (type === 'signup') {
          router.replace({ pathname: '/success', params: { type: 'confirmation' } })
        } else {
          router.replace({ pathname: '/(tabs)' })
        }
      })
      .catch((err) => {
        console.error('Erro no setSession:', err)
        router.replace('/(auth)/login')
      })
  }, [encodedUrl])
}


async function getOrCreateLocalUser(user:User): Promise<LocalUser> {
  if (!user.email) {
    throw new Error('User email is required to fetch/create local user.')
  }

  try {
    // 1) Tenta puxar o perfil existente
    const { data } = await api.get<LocalUser>(`/users/email/${user.email}`)
    return data
  } catch (err: any) {
    // 2) Se der 404, cria novo; caso contrário, relança
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
      }
      const { data } = await api.post<LocalUser>('/users', payload)
      return data
    } else {
      console.error('Erro ao buscar/criar usuário na API', err)
      throw err
    }
  }
}
