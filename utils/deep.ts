// utils/deep.ts
import * as AuthSession from 'expo-auth-session'

// Sempre gere o mesmo redirect URI para callback
export const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'epesportes',
  path: 'callback',
})
