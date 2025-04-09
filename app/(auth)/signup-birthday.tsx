// app/(auth)/signup-birthday.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/forms/Button';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import { useSignUp } from '@/contexts/SignUpContext';
import { router } from 'expo-router';
import { DatePickerField } from '@/components/forms/DatePickerField'; // seu componente customizado

const schema = z.object({
  birthdate: z.date({
    required_error: 'Data de nascimento é obrigatória',
    invalid_type_error: 'Data inválida',
  }),
});

type FormData = z.infer<typeof schema>;

export default function SignUpBirthdayScreen() {
  const theme = useTheme();
  const { updateData } = useSignUp();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 32,
      textAlign: 'center',
      marginBottom: 40,
      fontWeight: 'bold',
      color: theme.greenLight
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      birthdate: undefined,
    },
  });

  function onSubmit(data: FormData) {
    const formattedDate = data.birthdate.toISOString().split('T')[0];
    updateData({ birthdate: formattedDate });
    console.log('Data de nascimento:', formattedDate);
    router.push('/(auth)/signup-team');
  }

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>Data de Nascimento</StyledText>
      <DatePickerField
        name="birthdate"
        label="Nascimento"
        control={control}
        placeholder="Data"
      />

      <Button
        title="próximo"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}


