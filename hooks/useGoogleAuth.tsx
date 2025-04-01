// hooks/useGoogleAuth.ts
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    redirectUri: makeRedirectUri({
      scheme: 'app.json', // igual ao app.json expo.scheme
    }),
    
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { accessToken } = response.authentication!;
      handleLogin(accessToken);
    }
  }, [response]);

  async function handleLogin(idToken: string) {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await res.json();
      console.log('Login com Google sucesso:', data);
      // Salve os dados no contexto ou navegue para a próxima tela
    } catch (err) {
      console.error('Erro ao logar com Google:', err);
    }
  }

  return { request, promptAsync };
}
