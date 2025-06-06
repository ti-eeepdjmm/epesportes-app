import { Alert, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePathname } from 'expo-router';
import { useCallback } from 'react';

export function useSmartBackHandler() {
  const pathname = usePathname();
  console.log('Current pathname:', pathname);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const isInHomeTab =
          pathname === '/' || pathname === '/(tabs)';

        if (isInHomeTab) {
          Alert.alert('Sair do App', 'Deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', onPress: () => BackHandler.exitApp() },
          ]);
          return true;
        }else{
          // Permite comportamento normal de voltar
          return false;
        }
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [pathname])
  );
}
