import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { TabIcon } from '../../components/TabIcon';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.white,
        tabBarInactiveTintColor: theme.white,
        tabBarStyle: {
          backgroundColor: theme.greenBackground,
          borderTopColor: theme.white || '#ccc',
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily:'Poppins_400Regular',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="resenha"
        options={{
          title: 'Resenha',
          tabBarIcon: ({ focused }) => <TabIcon name="resenha" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Jogos',
          tabBarIcon: ({ focused }) => <TabIcon name="games" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
