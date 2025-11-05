// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TabIcon } from '@/components/icons/TabIcon';
import { useTheme } from '@/hooks/useTheme';
import { useSmartBackHandler } from '@/hooks/useSmartBackHandler';

export default function TabLayout(): JSX.Element {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme();

  // Lida com back em Android conforme sua lógica
  useSmartBackHandler();

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#fff',
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: true, // força exibição dos labels

          tabBarStyle: {
            backgroundColor: theme.greenBackground,
            borderTopColor: theme.white,
            paddingTop: 8,
            height: 64 + bottom,
          },

          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Poppins_400Regular',
          },

          // Mantém o estado das telas
          unmountOnBlur: false,

          // Cor de fundo das cenas + SafeArea aplicada nas telas
          sceneStyle: {
            backgroundColor: theme.white,
          },
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
    </>
  );
}
