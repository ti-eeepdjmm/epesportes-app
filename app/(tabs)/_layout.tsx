// app/(tabs)/_layout.tsx
import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { TabIcon } from '@/components/icons/TabIcon';
import { useTheme } from '@/hooks/useTheme';
import { useSmartBackHandler } from '@/hooks/useSmartBackHandler';

export default function TabLayout(): JSX.Element {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme();

  // Lida com back em Android conforme sua lógica
  useSmartBackHandler();

  // Memo para evitar recriação de objetos de estilo que podem causar flashes/re-render pesados
  const tabBarStyle = useMemo(() => ({
    backgroundColor: theme.greenBackground,
    borderTopColor: theme.white,
    paddingTop: 8,
    height: 64 + bottom,
  }), [theme.greenBackground, theme.white, bottom]);

  const sceneContainerStyle = useMemo(() => ({
    backgroundColor: theme.white,
  }), [theme.white]);

  const labelStyle = useMemo(() => ({
    fontSize: 12,
    // Garantir fallback caso a fonte ainda não esteja disponível momentaneamente
    fontFamily: 'Poppins_400Regular',
  }), []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      <StatusBar style={theme.greenBackground === '#000' ? 'light' : 'dark'} />
      <Tabs
        initialRouteName="index"
        // lazy evita montar todas as telas imediatamente, reduzindo risco de frame drop pós-splash
        // detachInactiveScreens mantém memória baixa e evita acúmulo, sem piscar pois usamos lazy
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#fff',
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: true,
          tabBarStyle,
          tabBarLabelStyle: labelStyle,
          unmountOnBlur: false,
          sceneStyle: sceneContainerStyle,
          // Melhorar performance evitando remount em foco
          lazy: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            unmountOnBlur: false,
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <TabIcon name="home" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: 'Jogos',
            unmountOnBlur: false,
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <TabIcon name="games" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="resenha"
          options={{
            title: 'Resenha',
            unmountOnBlur: false,
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <TabIcon name="resenha" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            unmountOnBlur: false,
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <TabIcon name="profile" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
