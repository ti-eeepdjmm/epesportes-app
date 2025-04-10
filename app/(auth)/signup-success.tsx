import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/forms/Button';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function SignUpSuccessScreen() {
  const theme = useTheme();

  return (
    <View style={styles(theme).container}>
      <Feather name="check-circle" size={64} color={theme.greenLight} />
      <StyledText style={styles(theme).title}>Conta criada com sucesso!</StyledText>
      <StyledText style={styles(theme).message}>
        Verifique seu e-mail para ativar sua conta antes de fazer login.
      </StyledText>

      <Button
        title="Ir para o Login"
        onPress={() => router.replace('/(auth)/login')}
        style={{ marginTop: 32 }}
      />
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.white,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.greenLight,
      marginTop: 16,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      color: theme.gray,
      marginTop: 12,
      paddingHorizontal: 16,
    },
  });
