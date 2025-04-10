import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { InputField } from '@/components/forms/InputField';
import { Button } from '@/components/forms/Button';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import { useSignUp } from '@/contexts/SignUpContext';



const signUpSchema = z
  .object({
    name: z.string().nonempty('O nome é obrigatório').min(2, 'Digite um nome válido'),
    email: z.string().nonempty('O e-mail é obrigatório').email('E-mail inválido'),
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
  const { updateData, data } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    getValues,
    trigger,
    formState: { isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit() {
    const isValid = await trigger();

    if (!isValid) return;
    const formData = getValues();
    const { confirmPassword, ...dataToSave } = formData;
    updateData(dataToSave);
    console.log('Dados do formulário:', formData);
    router.push('/(auth)/signup-birthday');
  }

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>Criar Conta</StyledText>
      <InputField name="name" label="Nome" placeholder="Nome" control={control} />
      <InputField name="email" label="Email" placeholder="Email" control={control} keyboardType="email-address" />
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
        onPress={onSubmit}
        loading={isSubmitting}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}


