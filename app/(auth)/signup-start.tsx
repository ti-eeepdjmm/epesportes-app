import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { InputField } from '@/components/forms/InputField';
import { Button } from '@/components/forms/Button';
import { Separator } from '@/components/Separator';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import GoogleIcon from '@/components/icons/GoogleIcon';
import { useSignUp } from '@/contexts/SignUpContext';


const signUpSchema = z.object({
  name: z.string().nonempty('O nome é obrigatório').min(2, 'Digite um nome válido'),
  email: z.string().nonempty('O e-mail é obrigatório').email('E-mail inválido'),
  password: z.string().nonempty('A senha é obrigatória').min(6, 'Mínimo de 6 caracteres'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpStart() {
  const theme = useTheme();
  const router = useRouter();
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
    getValues,
    trigger,
    formState: { isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit() {
    const isValid = await trigger();

    if (!isValid) return;

    const data = getValues();
    updateData(data); // <-- Salva os dados temporariamente
    console.log(data);
    router.push('/(auth)/signup-birthday');
  }

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>Criar Conta</StyledText>

      <Button
        title="Criar Conta com Google"
        onPress={() => { }}
        style={{ marginTop: 8 }}
        icon={<GoogleIcon />}
      />

      <Separator />

      <InputField name="name" label="Nome" placeholder="Nome" control={control} />
      <InputField name="email" label="Email" placeholder="Email" control={control} keyboardType="email-address" />
      <InputField name="password" label="Senha" placeholder="Senha" control={control} secureTextEntry />

      <Button
        title="Próximo"
        onPress={onSubmit}
        loading={isSubmitting}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}


