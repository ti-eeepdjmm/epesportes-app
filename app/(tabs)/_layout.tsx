// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
      {/* Protege só o topo; a área inferior é da Tab Bar */}
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.white }}>
        <Tabs
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#fff',
            tabBarHideOnKeyboard: true,

            // ⚠️ Altura final considera o bottom inset
            tabBarStyle: {
              backgroundColor: theme.greenBackground,
              borderTopColor: theme.white,
              height: 64 + bottom,     // altura mais compacta que 72
              paddingTop: 8,
              paddingBottom: bottom,    // respeita o notch/gesture area
            },

            tabBarLabelStyle: {
              fontSize: 12,
              fontFamily: 'Poppins_400Regular',
            },

            // Mantém o estado das telas
            unmountOnBlur: false,

            // Cor de fundo das cenas (em vez de SafeAreaView envolvendo Tabs)
            sceneStyle: { backgroundColor: theme.white },
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
      </SafeAreaView>
    </>
  );
}
