// app/(root)/StartApp.tsx
import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'
import { AppLoader } from '@/components/AppLoader'

import {
  isUserRegistered,
  getAccessToken,
  clearTokens,
} from '../utils/storage'
import { useAuth } from '@/contexts/AuthContext'

export default function StartApp() {
  const [loading, setLoading] = useState(true)
   const { signOut } = useAuth();//teste

  useEffect(() => {
    async function init() {
      try {
        // 1) Cold start: captura deep link, se existir
        const initialUrl = await Linking.getInitialURL()
        if (initialUrl) {
          const { path, queryParams } = Linking.parse(initialUrl)

          // trate somente os paths que você conhece:
          if (path === 'callback') {
            // queryParams pode vir como Record<string,string|boolean>
            const { token, type } = queryParams as {
              token?: string
              type?: 'signup' | 'recovery' | 'oauth'
            }
            router.replace({
              pathname: '/callback',
              params: { token: token!, type: type! },
            })
            return
          }

          if (path === 'reset-password') {
            const { token } = queryParams as { token?: string }
            router.replace({
              pathname: '/(auth)/reset-password',
              params: { token: token! },
            })
            return
          }

          // se tiver outros deep‑links, trate aqui...
        }

        // 2) Sem deep link: fluxo normal de auto‑login
        clearTokens() // Limpa os tokens antigos, se existirem
        signOut() //teste

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
