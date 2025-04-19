// app/(root)/StartApp.tsx
import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'
import { AppLoader } from '@/components/AppLoader'

import {
  isUserRegistered,
  getAccessToken,
  clearTokens,
  setUserRegistered
} from '../utils/storage'
import { useAuth } from '@/contexts/AuthContext'
import { set } from 'date-fns'

export default function StartApp() {
  const [loading, setLoading] = useState(true)
   const { signOut } = useAuth()

  useEffect(() => {
    async function init() {
      try {
        // 1) Cold‑start: intercepta apenas 'callback'
        const initialUrl = await Linking.getInitialURL()
        console.log('Cold start:', initialUrl)
        if (initialUrl) {
          const { path, queryParams } = Linking.parse(initialUrl)
          if (path === 'callback') {
            const { access_token, refresh_token, type } = queryParams as {
              access_token?: string
              refresh_token?: string
              type?: 'signup' | 'recovery' | 'oauth'
            }

            router.replace({
              pathname: '/callback',
              params: {
                access_token: access_token!,
                refresh_token: refresh_token!,
                type: type!,
              },
            })
            return
          }
        }

        // 2) Sem deep‑link: fluxo normal
        // Limpa os tokens e o contexto de autenticação(temporário)
        await clearTokens()
        setUserRegistered(false) // Limpa o estado de registro do usuário
        signOut() // Limpa o contexto de autenticação
        
        const token = await getAccessToken()
        const registered = await isUserRegistered()

        if (token) {
          router.replace('/(tabs)')
        } else if (!registered) {
          router.replace('/(onboarding)/start')
        } else {
          router.replace('/(auth)/login')
        }
      } catch (err: any) {
        console.error('Erro no fluxo de início:', err)
        await clearTokens()
        router.replace('/(auth)/login')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  return loading ? <AppLoader visible /> : null
}
