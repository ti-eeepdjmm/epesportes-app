import { Button } from '@/components/forms/Button';
import GoogleIcon from './icons/GoogleIcon';
import api from '@/utils/api';
import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';

export function GoogleOAuthButton() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async () => {
    try {
      setIsProcessing(true);

      const { data } = await api.get('/auth/login/google'); // Backend retorna a URL do Supabase
      const loginUrl = data.url;

      if (!loginUrl) {
        throw new Error('URL de login não encontrada');
      }

      await WebBrowser.openBrowserAsync(loginUrl);
    } catch (err) {
      console.error('Erro ao iniciar login com Google:', err);
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
