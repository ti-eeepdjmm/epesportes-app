import { Tabs } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { TabIcon } from '../../components/icons/TabIcon';
import { StatusBar } from 'expo-status-bar';
import { useThemeContext } from '@/contexts/ThemeContext'

export default function TabLayout() {
  const colorScheme = useThemeContext()
  const theme = useTheme();
  const barStyle = colorScheme.theme === 'dark' ? 'light' : 'dark'

  return (
    <SafeAreaView
      style={styles(theme).safeArea}
    >
      <StatusBar style={barStyle} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.white,
          tabBarInactiveTintColor: theme.white,
          tabBarStyle: {
            backgroundColor: theme.greenBackground,
            borderTopColor: theme.white || '#ccc',
            height: 72,
            paddingTop: 12,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Poppins_400Regular',
            color: "white",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ focused }: any) => <TabIcon name="home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: 'Jogos',
            tabBarIcon: ({ focused }: any) => <TabIcon name="games" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="resenha"
          options={{
            title: 'Resenha',
            tabBarIcon: ({ focused }: any) => <TabIcon name="resenha" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ focused }: any) => <TabIcon name="profile" focused={focused} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = (theme:any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.white,
  },
});
