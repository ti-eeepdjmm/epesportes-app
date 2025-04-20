// app/(auth)/reset-password.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { InputField } from '@/components/forms/InputField'
import { Button } from '@/components/forms/Button'
import { StyledText } from '@/components/StyledText'
import { useTheme } from '@/hooks/useTheme'
import api from '@/utils/api'
import * as Linking from 'expo-linking'
import { useAuth } from '@/contexts/AuthContext'

// 1) Schemas Zod
const emailSchema = z.object({
  email: z.string().nonempty('O e‑mail é obrigatório').email('E‑mail inválido')
  .refine(async (email) => {
    try {
      const response = await api.get(`/users/email/${encodeURIComponent(email)}`); 
      return response.data.exists === undefined;
    } catch {
      // se erro na API, não bloqueia, apenas não valida duplicado
      return false;
    }
  }, 'E-mail não cadastrado'),
})

const passwordSchema = z
  .object({
    password: z.string().nonempty('Digite uma senha').min(6, 'Mínimo de 6 caracteres'),
    confirmPassword: z.string().nonempty('Confirme a senha').min(6, 'Mínimo de 6 caracteres'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type EmailForm = z.infer<typeof emailSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ResetPasswordScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token?: string }>()
  const { user, signIn } = useAuth()

  // Forms separados: um para envio de e‑mail, outro para atualizar senha
  const {
    control: emailControl,
    handleSubmit: handleSendEmail,
    formState: { errors: emailErrors, isSubmitting: isSendingEmail },
  } = useForm<EmailForm>({ resolver: zodResolver(emailSchema), defaultValues: { email: '' } })

  const {
    control: pwdControl,
    handleSubmit: handleUpdatePwd,
    formState: { errors: pwdErrors, isSubmitting: isUpdatingPwd },
  } = useForm<PasswordForm>({ 
    resolver: zodResolver(passwordSchema), 
    defaultValues: {
      confirmPassword: '',
      password: '',
    }})
  

  // 2) Caso user já autenticado e sem token, pular direto para form de atualização
  const showEmailForm = !token && !user

  // 3) Enviar e‑mail de recuperação (não autenticado)
  const onSendEmail = async (data: EmailForm) => {
    try {
      const redirectTo = Linking.createURL('/callback')
      await api.post('/auth/recover-password', {
        email: data.email,
        redirectTo,
      })
      // em vez de só um Alert simples, defina botão com callback:
    Alert.alert(
      'E‑mail enviado',
      'Verifique sua caixa de entrada para continuar.',
      [
        {
          text: 'OK',
          onPress: () => {
            // navega pra tela de sucesso
            router.replace({ pathname: '/success', params: { type: 'recovery' } })
          },
        },
      ],
      { cancelable: false }
    )
      
    } catch (err: any) {
      console.error(err)
      Alert.alert('Erro', err.message || 'Não foi possível enviar o e‑mail.')
    }
  }

  // 4) Atualizar senha (token ou sessão autenticada)
  const onUpdatePassword = async (data: PasswordForm) => {
    try {
      // o interceptor do `api` já adiciona os headers com os tokens
      await api.post('/auth/update-password', { 
        newPassword: data.password, 
      })
      Alert.alert('Sucesso', 'Senha atualizada')
      router.replace('/(auth)/login')
    } catch (err) {
      Alert.alert('Erro', 'Erro ao atualizar a senha.')
      router.replace('/(auth)/login')
    }
  
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {showEmailForm ? (
        <>
          <StyledText style={[styles.title, { color: theme.greenLight }]}>
            Recuperar senha
          </StyledText>
          <StyledText style={[styles.subtitle, { color: theme.black }]}>
          Enviaremos um email de recuperação para sua conta.
          </StyledText>
          <InputField
            name="email"
            label="E‑mail"
            control={emailControl}
            keyboardType="email-address"
          />
          <Button
            title="Envia e‑mail"
            onPress={handleSendEmail(onSendEmail)}
            loading={isSendingEmail}
            style={styles.button}
          />
        </>
      ) : (
        <>
          <StyledText style={[styles.title, { color: theme.greenLight }]}>
            Redefinir senha
          </StyledText>
          <StyledText style={[styles.subtitle, { color: theme.black }]}>
            Escolha sua nova senha
          </StyledText>
          <InputField
            name="password"
            label="Nova senha"
            control={pwdControl}
            secure
          />
          <InputField
            name="confirmPassword"
            label="Confirmar senha"
            control={pwdControl}
            secure
          />
          <Button
            title="Atualizar senha"
            onPress={handleUpdatePwd(onUpdatePassword)}
            loading={isUpdatingPwd}
            style={styles.button}
          />
        </>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
})
