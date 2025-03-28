import { useEffect, useState } from 'react';
import { isUserRegistered } from '../utils/storage';
import { router } from 'expo-router';

export default function StartApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const registered = await isUserRegistered();
      if (registered) {
        router.replace('./(auth)/login');
      } else {
        router.replace('./(tabs)/'); // sua tela inicial de boas-vindas
      }
    }
    check();
  }, []);

  return loading ? null : <></>; // ou um splash loader
}

