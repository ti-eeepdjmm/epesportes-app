import React from 'react';
import { Tabs } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TabIcon } from '@/components/icons/TabIcon';
import { useTheme } from '@/hooks/useTheme';
import { useSmartBackHandler } from '@/hooks/useSmartBackHandler';

export default function TabLayout(): JSX.Element {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  useSmartBackHandler();

  

  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: "#fff",
    tabBarInactiveTintColor:"#fff",
    tabBarStyle: {
      backgroundColor: theme.greenBackground,
      borderTopColor: theme.white,
      height: 72 + insets.bottom,
      paddingTop: 12,
      paddingBottom: insets.bottom,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontFamily: 'Poppins_400Regular',
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.white }}>
      <StatusBar style={'dark'} />
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ focused }: any) => (
              <TabIcon name="home" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: 'Jogos',
            tabBarIcon: ({ focused }: any) => (
              <TabIcon name="games" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="resenha"
          options={{
            title: 'Resenha',
            tabBarIcon: ({ focused }: any) => (
              <TabIcon name="resenha" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ focused }: any) => (
              <TabIcon name="profile" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
