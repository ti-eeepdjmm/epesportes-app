import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { StyledText } from '@/components/StyledText'
import { Button } from '@/components/forms/Button'
import { useRouter, useLocalSearchParams } from 'expo-router'
import LottieView from 'lottie-react-native'

type Params = {
  type?: 'signup' | 'recovery' | 'confirmation'
}

const messages = {
  signup: {
    title: 'Conta criada com sucesso!',
    message: 'Verifique seu e‑mail para ativar sua conta antes de fazer login.',
    buttonText: 'Ir para o Login',
  },
  recovery: {
    title: 'Link enviado com sucesso!',
    message: 'Verifique seu e‑mail para redefinir sua senha.',
    buttonText: 'Voltar ao Login',
  },
  confirmation: {
    title: 'E‑mail confirmado!',
    message: 'Sua conta está ativa. Vamos começar?',
    buttonText: 'Ir para o login',
  },
}

export default function SuccessScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { type } = useLocalSearchParams<Params>()
  const cfg = messages[type as keyof typeof messages] || messages.signup

  const handlePress = () => {
    // Roteia usando literais, para satisfazer o TypeScript
      router.replace('/login');
  
  }

  return (
    <View style={styles(theme).container}>
      <LottieView
        source={require('@/assets/animations/success.json')}
        autoPlay
        loop={false}
        style={styles(theme).animation}
      />
      <StyledText style={styles(theme).title}>{cfg.title}</StyledText>
      <StyledText style={styles(theme).message}>{cfg.message}</StyledText>
      <Button
        title={cfg.buttonText}
        onPress={handlePress}
        style={styles(theme).button}
      />
    </View>
  )
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
    animation: {
      width: 120,
      height: 120,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.greenLight,
      textAlign: 'center',
      marginTop: 16,
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      color: theme.black,
      marginTop: 12,
      paddingHorizontal: 16,
    },
    button: {
      marginTop: 32,
      width: '80%',
    },
  })
