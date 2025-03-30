// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ou true, se quiser cabeçalho
        animation: 'slide_from_right',
      }}
    >
      {/* Todas as telas em (auth) serão envolvidas por essa Stack */}
    </Stack>
  );
}
