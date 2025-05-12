// hooks/useCustomBack.ts
import { BackHandler } from 'react-native';
import { RelativePathString, useRouter } from 'expo-router';
import { useEffect } from 'react';

export function useCustomBack(fallbackRoute: string) {
  const router = useRouter();

  useEffect(() => {
    const onBackPress = () => {
      router.replace(fallbackRoute as RelativePathString);
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [fallbackRoute]);
}
