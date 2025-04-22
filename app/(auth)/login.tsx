// app/(auth)/login.tsx
import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { InputField } from '@/components/forms/InputField'
import { Button } from '@/components/forms/Button'
import { StyledText } from '@/components/StyledText'
import { useTheme } from '@/hooks/useTheme'
import { router } from 'expo-router'
import GoogleIcon from '@/components/icons/GoogleIcon'
import api from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/utils/supabase'
import * as WebBrowser from 'expo-web-browser'
import { REDIRECT_URI } from '@/utils/deep'  // já gerado com makeRedirectUri
import axios, { AxiosError } from 'axios'
import { User as LocalUser } from '@/types'
import { getAccessToken } from '@/utils/storage'



// Validação com Zod
const loginSchema = z.object({
  email: z.string().nonempty('O e‑mail é obrigatório').email('E‑mail inválido'),
  password: z
    .string()
    .nonempty('A senha é obrigatória')
    .min(6, 'Mínimo de 6 caracteres'),
})
type LoginFormData = z.infer<typeof loginSchema>

// * Retire* esta linha do topo do arquivo e coloque somente **uma vez** no app/_layout.tsx
WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const theme = useTheme()
  const { signIn } = useAuth()
  const [userLoading, setUserLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function handleLogin(form: LoginFormData) {
    try {
      setUserLoading(true)
  
      // 1) Chama sua API
      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      })
  
      // 2) Extrai user + tokens
      const user = res.data.user
      const accessToken = await getAccessToken();
      console.log("access_token:(login)", accessToken);
  
      // 3) Faz o signIn no contexto
      const { data: localUser } = await api.get<LocalUser>(`/users/email/${user.email}`)
      await signIn(accessToken!, {
        id: localUser.id,
        authUserId: user.id,
        name: localUser.name,
        email: localUser.email,
        profilePhoto: localUser.profilePhoto,
        favoriteTeam: localUser.favoriteTeam,
        isAthlete: localUser.isAthlete,
        birthDate: localUser.birthDate,
        hasPasswordLogin: true,
      })
  
      // 4) Redireciona
      router.replace('/(tabs)')
    } catch (err: unknown) {
      // 5) Tratamento de erro
      let message = 'Erro inesperado. Tente novamente mais tarde.'
  
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ message?: string }>
        const status = axiosErr.response!.status
  
        // backend retorna { message: string } no corpo
        const apiMessage = axiosErr.response?.data?.message
  
        if (status === 401) {
          message = apiMessage || 'E‑mail ou senha incorretos.'
        } else if (status === 400) {
          message = apiMessage || 'Dados inválidos. Verifique e tente de novo.'
        } else if (status >= 500) {
          message = 'Erro no servidor. Tente novamente mais tarde.'
        } else if (status === undefined) {
          // sem resposta: falha de rede
          message = 'Sem conexão. Verifique sua internet.'
        }
      } else if (err instanceof Error) {
        message = err.message
      }
  
      Alert.alert('Erro ao fazer login', message)
    } finally {
      setUserLoading(false)
    }
  }

  async function handleOAuth() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_URI,
        skipBrowserRedirect: true,
      },
    })
    if (error) {
      Alert.alert('Erro ao iniciar login com Google', error.message)
      return
    }
    // abre o navegador e espera o usuário concluir
    await WebBrowser.openAuthSessionAsync(data.url!, REDIRECT_URI)
    // **não precisa** aqui chamar router.push — seu handler global vai capturar o deep link e redirecionar pro callback
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StyledText style={[styles.title, { color: theme.greenLight }]}>
        Login
      </StyledText>
      <StyledText style={[styles.subtitle, { color: theme.black }]}>
        Entre na sua conta
      </StyledText>

      <View style={styles.form}>
        <InputField
          name="email"
          label="E‑mail"
          placeholder="Digite seu e‑mail"
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
          loading={isSubmitting || userLoading}
          style={styles.button}
        />
        <Button
          title="Login com Google"
          onPress={handleOAuth}
          icon={<GoogleIcon color={theme.white} />}
          style={styles.button}
        />

        <View style={styles.links}>
          <StyledText style={{ color: theme.greenLight,}}>
            Ainda não tem conta?
          </StyledText>
          <StyledText
            style={[styles.link, { color: theme.greenLight,}]}
            onPress={() => router.push('/(auth)/signup-start')}
          >
            Cadastre‑se
          </StyledText>
        </View>
        <View style={styles.links}>
          <StyledText style={{ color: theme.greenLight }}>
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
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 8, width: '100%' },
  title: { fontSize: 40, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  form: { gap: 0 },
  button: { marginTop: 16 },
  link: { textDecorationLine: 'underline' },
})
