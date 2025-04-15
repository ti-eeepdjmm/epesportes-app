import { useEffect, useState } from 'react';
import { isUserRegistered } from '../utils/storage';
import { router } from 'expo-router';
import { AppLoader } from '@/components/AppLoader';

export default function StartApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const registered = await isUserRegistered();
      if (registered) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(onboarding)/start'); // sua tela inicial de boas-vindas
      }
    }
    check();
  }, []);

  return loading ? <AppLoader visible={loading} /> : <></>; // ou um splash loader
}

