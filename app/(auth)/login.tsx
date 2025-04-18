import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, Alert} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { InputField } from '@/components/forms/InputField';
import { Button } from '@/components/forms/Button';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import GoogleIcon from '../../components/icons/GoogleIcon';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@supabase/supabase-js';
//deeplink testing
import { supabase } from '@/utils/supabase';
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'


// Validação do formulário com Zod
const loginSchema = z.object({
  email: z.string().nonempty('O e-mail é obrigatório').email('E-mail inválido'),
  password: z.string().nonempty('A senha é obrigatória').min(6, 'Mínimo de 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn, signOut } = useAuth();
  const [ user, setUser ] = useState<User>();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Função chamada após validação
  const handleLogin = async (data: LoginFormData) => {
    try {
      // 1) Chama a API
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
  
      // 2) Pega o user do corpo
      const user: User = response.data.user;
      setUser(user);
  
      // 3) Extrai os tokens dos headers
      const authHeader    = response.headers['authorization'];
      const refreshHeader = response.headers['x-refresh-token'];
  
      if (!authHeader || !refreshHeader) {
        throw new Error('Tokens não recebidos');
      }
  
      const accessToken  = authHeader.replace(/^Bearer\s+/, '');
  
      // 4) Usa o contexto de autenticação
      await signIn(accessToken, {
        id:    user.id,
        name:  user.user_metadata.full_name,
        email: user.email ?? '',
        profilePhoto: user.user_metadata.avatar_url,
      });
  
      // 5) Redireciona
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Erro ao fazer login', err.message || 'Erro desconhecido');
    }
  };
  // Função chamada quando o usuário clica no botão de login com Google
  // Essa função abre uma janela de autenticação do Google e redireciona o usuário para a tela de login
  async function handleOAuth() {
    const redirectTo = Linking.createURL('callback')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StyledText style={[styles.title, { color: theme.greenLight }]}>Login</StyledText>
      <StyledText style={[styles.subtitle, { color: theme.black }]}>Entre na sua conta</StyledText>

      <View style={styles.form}>
        <InputField
          name="email"
          label="E-mail"
          placeholder="Digite seu e-mail"
          control={control}
          keyboardType="email-address"

        />

        <InputField
          name="password"
          label="Senha"
          placeholder="Digite sua senha"
          control={control}
          secure
        />

        <Button
          title="Entrar"
          onPress={handleSubmit(handleLogin)}
          loading={isSubmitting}
          style={styles.button}
        />
        <Button
          title="Login com Google"
          onPress={handleOAuth}
          icon={<GoogleIcon color={theme.white} />}
          style={styles.button}
        />

        <View style={styles.links}>
          <StyledText
            style={[{ color: theme.greenLight }]}
          >
            Ainda não tem conta?
          </StyledText>
          <StyledText
            style={[styles.link, { color: theme.greenLight }]}
            onPress={() => router.push('/(auth)/signup-start')}
          >
            Cadastre-se
          </StyledText>
        </View>
        <View style={styles.links}>
          <StyledText
            style={[{ color: theme.greenLight }]}
          >
            Esqueceu a senha?
          </StyledText>
          <StyledText
            style={[styles.link, { color: theme.greenLight }]}
            onPress={() => router.push('/(auth)/reset-password')}
          >
            Recuperar senha
          </StyledText>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  title: {
    fontSize: 40,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 0,
  },
  button: {
    marginTop: 16,
  },
  link: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
