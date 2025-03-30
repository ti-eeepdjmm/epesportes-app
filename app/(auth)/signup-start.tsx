import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { InputField } from '@/components/forms/InputField';
import { Button } from '@/components/forms/Button';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';

import { router } from 'expo-router';


const signUpSchema = z.object({
  name: z.string().min(2, 'Digite um nome válido'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpStart() {
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  function onSubmit(data: SignUpFormData) {
    // TODO: conectar ao backend
    console.log('Dados do formulário:', data);
    router.push('/signup-birthday'); // caminho relativo à pasta (auth)
  }

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>Criar Conta</StyledText>

      {/* TODO: Botão Google */}
      <TouchableOpacity style={[styles.googleButton, { backgroundColor: theme.greenBackground }]}>
        <StyledText style={styles.googleText}>Criar Conta com Google</StyledText>
      </TouchableOpacity>

      <View style={styles.divider} />

      <InputField
        name="name"
        label="Nome"
        placeholder="Nome"
        control={control}
      />
      <InputField
        name="email"
        label="Email"
        placeholder="Email"
        control={control}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <InputField
        name="password"
        label="Senha"
        placeholder="Senha"
        control={control}
        secureTextEntry
      />

      <Button
        title="Próximo"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  googleButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  googleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 24,
  },
});
