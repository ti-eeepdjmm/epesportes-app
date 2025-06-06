import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useSegments } from 'expo-router';

export function useSmartBackHandler() {
  const segments = useSegments();

  useEffect(() => {
    const onBackPress = () => {
      const currentPath = segments.join('/');

      const isModal = segments[0] === '(modals)';
      const isInHomeTab =
            currentPath === '(tabs)' ||
            currentPath === '(tabs)/index' ||
            segments[1]?.toLowerCase() === 'index'; // safe check


      if (isModal) {
        // Deixa o comportamento default (router.dismiss)
        return false;
      }

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
