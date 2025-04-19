import React, { useState } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/utils/api';

import { InputField } from '@/components/forms/InputField';
import { Button } from '@/components/forms/Button';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import { useSignUp } from '@/contexts/SignUpContext';

// Schema com validação assíncrona de e-mail duplicado
const signUpSchema = z
  .object({
    name: z.string().nonempty('O nome é obrigatório').min(2, 'Digite um nome válido'),
    email: z
      .string()
      .nonempty('O e-mail é obrigatório')
      .email('E-mail inválido')
      .refine(async (email) => {
        try {
          const response = await api.get(`/users/email/${encodeURIComponent(email)}`);
          return response.data.exists === false; // false = não cadastrado
        } catch {
          // se erro na API, não bloqueia, apenas não valida duplicado
          return true;
        }
      }, 'E-mail já cadastrado'),
    password: z.string().nonempty('A senha é obrigatória').min(6, 'Mínimo de 6 caracteres'),
    confirmPassword: z.string().nonempty('Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpStart() {
  const theme = useTheme();
  const { updateData } = useSignUp();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
      backgroundColor: theme.white,
    },
    title: {
      fontSize: 32,
      textAlign: 'center',
      marginBottom: 24,
      color: theme.greenLight,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: SignUpFormData) {
    const { confirmPassword, ...dataToSave } = data;
    updateData(dataToSave);
    router.push('/(auth)/signup-birthday');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StyledText style={styles.title}>Criar Conta</StyledText>

      <InputField
        name="name"
        label="Nome"
        placeholder="Nome"
        control={control}
        
      />

      <InputField
        name="email"
        label="E-mail"
        placeholder="Email"
        control={control}
        keyboardType="email-address"
       
      />

      <InputField
        name="password"
        label="Senha"
        placeholder="Senha"
        control={control}
        secure
       
      />

      <InputField
        name="confirmPassword"
        label="Confirmar senha"
        placeholder="Confirmar senha"
        control={control}
        secure
      />

      <Button
        title="Próximo"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={{ marginTop: 16 }}
      />
    </KeyboardAvoidingView>
  );
}
