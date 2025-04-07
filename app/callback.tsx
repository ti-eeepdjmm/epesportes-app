import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import api from '@/utils/api';
import { useSignUp } from '@/contexts/SignUpContext';

export default function CallbackScreen() {
  const { updateData, reset } = useSignUp();
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const url = await Linking.getInitialURL();
      console.log(`URL: ${url}`)

      if (!url || !url.includes('#')) {
        console.error('URL inválida ou sem fragmento');
        return;
      }

      const fragment = url.split('#')[1];
      const accessToken = new URLSearchParams(fragment).get('access_token');

      if (!accessToken) {
        console.error('access_token não encontrado na URL');
        return;
      }

      try {
        const res = await api.post(
          '/auth/me',
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const { user } = res.data;
        console.log(user)
        updateData({
          name: user.user_metadata.full_name,
          email: user.email,
        });

        router.replace('/(auth)/signup-birthday');
      } catch (err) {
        console.error('Erro ao autenticar com backend:', err);
      }
    };

    handleAuth();
  }, []);

  return null;
}
