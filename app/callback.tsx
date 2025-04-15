import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, Alert } from 'react-native';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { supabase } from '../utils/supabase';

export default function CallbackScreen() {
  const { url } = useLocalSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');

  useEffect(() => {
    const validateAndCreateSession = async () => {
      if (!url || Array.isArray(url)) return;

      const { params, errorCode } = QueryParams.getQueryParams(url);
      const { access_token, refresh_token } = params ?? {};

      if (errorCode || !access_token || !refresh_token) {
        setStatus('idle');
        return; // evita redirecionamento em chamadas inválidas
      }

      setStatus('loading');

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        Alert.alert('Erro ao salvar sessão', error.message);
        setStatus('error');
        return;
      }

      setStatus('success');
      router.replace('/');
    };

    validateAndCreateSession();
  }, [url]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      {(status === 'loading' || status === 'idle') && <ActivityIndicator size="large" />}
      <Text style={{ marginTop: 16, fontSize: 16 }}>
        {status === 'loading' && 'Fazendo login...'}
        {status === 'success' && 'Login realizado! Redirecionando...'}
        {status === 'error' && 'Houve um erro no login.'}
        {status === 'idle' && 'Aguardando confirmação de login...'}
      </Text>
    </View>
  );
}