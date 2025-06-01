import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useSegments } from 'expo-router';

export function useSmartBackHandler() {
  const segments = useSegments();

  useEffect(() => {
    const onBackPress = () => {
      const currentPath = segments.join('/');

      // Ajuste conforme sua home real (ex: (tabs)/index ou somente (tabs))
      const isInHomeTab = currentPath === '(tabs)' || currentPath === '(tabs)/index';

      if (isInHomeTab) {
        Alert.alert('Sair do App', 'Deseja sair?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }

      // Permite comportamento normal de voltar
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [segments]);
}

