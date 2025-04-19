// app/callback.tsx
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { supabase } from '@/utils/supabase'
import { AppLoader } from '@/components/AppLoader'
import { useAuth } from '@/contexts/AuthContext'
import { setTokens } from '@/utils/storage'

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
    
    console.log('Params:', params)
    
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
          router.replace({ pathname: '/signup-success' })
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
