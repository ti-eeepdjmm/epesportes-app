import { Button } from '@/components/forms/Button';
import GoogleIcon from './icons/GoogleIcon';
import api from '@/utils/api';
import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useSignUp } from '@/contexts/SignUpContext';

WebBrowser.maybeCompleteAuthSession();

export function GoogleOAuthButton() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { updateData, reset } = useSignUp();

  const handleLogin = async () => {
    try {
      setIsProcessing(true);

      // 1. Solicita ao backend a URL de login do Supabase
      const { data } = await api.get('/auth/login/google');
      const loginUrl = data.url;

      if (!loginUrl) throw new Error('URL de login não encontrada');

      // 2. Abre o navegador e aguarda a URL final
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        'https://epesportes-api-production.up.railway.app/auth/finish-google-login', // ← deve bater com a URL final do backend
      );

      // 3. Verifica se houve redirecionamento de sucesso
      if (result.type === 'success' && result.url) {
        const response = await fetch(result.url);
        const data = await response.json();
        const user = data.user;

        // 4. Atualiza o contexto do app com os dados do usuário
        reset();
        updateData({
          name: user.user_metadata.full_name,
          email: user.email,
        });
        console.log('Usuário autenticado:', user);

        // 5. Redireciona para próxima etapa do registro
        router.replace('/(auth)/signup-birthday');
      }
    } catch (err) {
      console.error('Erro ao fazer login com Google:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      title="Cadastrar com Google"
      onPress={handleLogin}
      icon={<GoogleIcon />}
      disabled={isProcessing}
    />
  );
}
