import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/forms/Button';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';

export default function SignUpSuccessScreen() {
  const theme = useTheme();

  return (
    <View style={styles(theme).container}>
      <LottieView
        source={require('@/assets/animations/success.json')}
        autoPlay
        loop={false}
        style={styles(theme).animation}
      />
      <StyledText style={styles(theme).title}>Email enviado!</StyledText>
      <StyledText style={styles(theme).message}>
      Verifique sua caixa de email!
      </StyledText>

      <Button
        title="Ir para o Login"
        onPress={() => router.replace('/(auth)/login')}
        style={{ marginTop: 32 }}
      />
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
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
    marginTop: 0,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.black,
    marginTop: 12,
    paddingHorizontal: 16,
  },
});

