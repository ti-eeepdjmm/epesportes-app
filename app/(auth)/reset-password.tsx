import React from 'react';
import {
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { InputField } from '@/components/forms/InputField';
import { Button } from '@/components/forms/Button';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { clearTokens } from '@/utils/storage';

// Schemas Zod
const emailSchema = z.object({
  email: z.string().nonempty('O e‑mail é obrigatório').email('E‑mail inválido')
    .refine(async (email) => {
      try {
        const response = await api.get(`/users/email/${encodeURIComponent(email)}`);
        return response.data.exists === undefined;
      } catch {
        return false;
      }
    }, 'E-mail não cadastrado'),
});

const passwordSchema = z.object({
  password: z.string().nonempty('Digite uma senha').min(6, 'Mínimo de 6 caracteres'),
  confirmPassword: z.string().nonempty('Confirme a senha').min(6, 'Mínimo de 6 caracteres'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type EmailForm = z.infer<typeof emailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { user, signOut } = useAuth();

  const {
    control: emailControl,
    handleSubmit: handleSendEmail,
    formState: { isSubmitting: isSendingEmail },
  } = useForm<EmailForm>({ resolver: zodResolver(emailSchema), defaultValues: { email: '' } });

  const {
    control: pwdControl,
    handleSubmit: handleUpdatePwd,
    formState: { isSubmitting: isUpdatingPwd },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { confirmPassword: '', password: '' },
  });

  const showEmailForm = !token && !user;

  // Detecta se é um OAuth User que ainda não tem email/password
  const isOAuthUserWithoutPassword = !!user && !user.hasPasswordLogin;

  const onSendEmail = async (data: EmailForm) => {
    try {
      await api.post('/auth/recover-password', { email: data.email });
      Alert.alert(
        'E‑mail enviado',
        'Verifique sua caixa de entrada para continuar.',
        [{ text: 'OK', onPress: () => router.replace({ pathname: '/success', params: { type: 'recovery' } }) }],
        { cancelable: false }
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert('Erro', err.message || 'Não foi possível enviar o e‑mail.');
    }
  };

  const onUpdatePassword = async (data: PasswordForm) => {
    try {
      if (isOAuthUserWithoutPassword) {
        // Novo fluxo: criar senha (registrar email/password via backend)
        await api.post('/auth/register', {
          full_name: user?.name,
          email: user?.email,
          password: data.password,
        });
        Alert.alert('Sucesso', 'Senha criada com sucesso!');
      } else {
        // Fluxo normal: alterar senha
        await api.post('/auth/update-password', {
          newPassword: data.password,
        });
        Alert.alert('Sucesso', 'Senha atualizada!');
      }

      await clearTokens();
      await signOut();
      router.replace('/(auth)/login');

    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Erro ao atualizar/criar a senha.');
      await clearTokens();
      await signOut();
      router.replace('/(auth)/login');
    }
  };

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
            Enviaremos um e-mail de recuperação para sua conta.
          </StyledText>
          <InputField
            name="email"
            label="E‑mail"
            control={emailControl}
            keyboardType="email-address"
          />
          <Button
            title="Enviar e‑mail"
            onPress={handleSendEmail(onSendEmail)}
            loading={isSendingEmail}
            style={styles.button}
          />
        </>
      ) : (
        <>
          <StyledText style={[styles.title, { color: theme.greenLight }]}>
            {isOAuthUserWithoutPassword ? 'Criar senha' : 'Redefinir senha'}
          </StyledText>
          <StyledText style={[styles.subtitle, { color: theme.black }]}>
            {isOAuthUserWithoutPassword
              ? 'Defina sua primeira senha para acessar também via e-mail.'
              : 'Escolha sua nova senha'}
          </StyledText>
          <InputField
            name="password"
            label="Nova senha"
            control={pwdControl}
            secure
          />
          <InputField
            name="confirmPassword"
            label="Confirmar nova senha"
            control={pwdControl}
            secure
          />
          <Button
            title={isOAuthUserWithoutPassword ? 'Criar senha' : 'Atualizar senha'}
            onPress={handleUpdatePwd(onUpdatePassword)}
            loading={isUpdatingPwd}
            style={styles.button}
          />
        </>
      )}
    </KeyboardAvoidingView>
  );
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
});
