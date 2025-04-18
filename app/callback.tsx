// app/callback.tsx
import { useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '../utils/supabase' // seu client
import { AppLoader } from '@/components/AppLoader'

// Define o shape dos params para ganhar tipagem
type Params = {
  access_token?: string
  refresh_token?: string
  type?: 'signup' | 'recovery' | 'oauth'
}

export default function Callback() {
  const router = useRouter()
  const { access_token, refresh_token, type } =
    useLocalSearchParams<Params>()  // <-- aqui

  useEffect(() => {
    if (!access_token) return
    supabase.auth
      .setSession({ access_token, refresh_token: refresh_token! })
      .then(({ error }) => {
        if (error) throw error

        // redireciona conforme o type
        if (type === 'signup') router.replace('/(auth)/signup-success')
        else if (type === 'recovery')
          router.replace(`/reset-password?token=${access_token}`)
        else router.replace('/(tabs)')
      })
      .catch(console.error)
  }, [access_token, refresh_token, type])

  return <AppLoader visible />
}
