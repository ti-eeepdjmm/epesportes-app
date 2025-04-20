// app/callback.tsx
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { supabase } from '@/utils/supabase'
import { AppLoader } from '@/components/AppLoader'
import { useAuth } from '@/contexts/AuthContext'
import { setTokens } from '@/utils/storage'
import api from '@/utils/api'
import { User } from '@supabase/supabase-js'

// Defina a interface do seu usuário local, se ainda não tiver
interface LocalUser {
  id: string
  authUserId: string
  name: string
  email: string
  favoriteTeam: string | null
  profilePhoto: string | null
  isAthlete: boolean
  birthDate: string | null
  // …outros campos
}

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
        await getOrCreateLocalUser(user);
        
        // salva no seu contexto
        await signIn(access_token, {
          id: user.id,
          name: user.user_metadata.full_name,
          email: user.email ?? '',
          profilePhoto: user.user_metadata.avatar_url,
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

  return <AppLoader visible />
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
        favoriteTeam: null,
        profilePhoto: user.user_metadata.avatar_url ?? null,
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
