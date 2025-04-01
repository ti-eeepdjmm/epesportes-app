import { Button } from '@/components/forms/Button';
import { useSignUp } from '@/contexts/SignUpContext';
import api from '@/utils/api';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import GoogleIcon from './icons/GoogleIcon';


export function GoogleOAuthButton() {
  
const { updateData } = useSignUp();

  async function handleGoogleSignUp() {
    try {
      const urlTeste = `${process.env.EXPO_PUBLIC_API_URL}/auth/login/google`
      // 1. Solicita a URL de login com Google ao backend
      console.log("url", urlTeste)
      const { data } = await api.get(`${process.env.EXPO_PUBLIC_API_URL}/auth/login/google`);
      console.log("data.url", data.url)
     
      

      // 2. Abre o navegador com a URL de autenticação
      const result = await WebBrowser.openAuthSessionAsync(data.url, process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URL);

      // 3. Verifica se o usuário retornou com sucesso e extrai o token da URL
      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const id_token = url.searchParams.get('id_token');

        if (!id_token) throw new Error('ID Token não encontrado na URL');

        // 4. Envia o token para o backend fazer login no Supabase
        const res = await api.post('/auth/login/token', {
          id_token,
          provider: 'google',
        });

        const { user } = res.data;

        // 5. Atualiza o contexto com os dados do usuário
        updateData({
          name: user.user_metadata.full_name,
          email: user.email,
        });

        // 6. Redireciona para próxima etapa
        router.push('/(auth)/signup-birthday');
      }
    } catch (error) {
      console.error('Erro durante login com Google:', error);
    }
  }

  return (
    <Button
      title="Cadastrar com Google"
      onPress={handleGoogleSignUp}
      icon={<GoogleIcon />}
    />
  );
}
