import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

export function useSmartBackHandler() {
  const router = useRouter();
  const segments = useSegments();

  const isOnHome = !segments[1]; 

  useEffect(() => {
    const onBackPress = () => {
      if (!isOnHome) {
        router.replace('/(tabs)');
        return true;
      }

      Alert.alert('Sair do App', 'Deseja sair?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [isOnHome]);
}
