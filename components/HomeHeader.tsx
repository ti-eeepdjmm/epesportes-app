// src/components/HomeHeader.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TextInput, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import BellIcon from './icons/BellIcon';
import { useTheme } from '@/hooks/useTheme';

export function HomeHeader() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { state, dispatch } = useNotifications();
  const [notifications, setNotifications] = useState(0)

  // Calcula quantas notificações não lidas existem
  useEffect(() => {
    setNotifications(state.items.filter(n => !n.read).length);
  }, [state]);

  return (
    <View style={styles(theme).container}>
      <TouchableOpacity
        onPress={() => {
          // Navega para profile
          router.push('/(tabs)/profile');
        }}
      >
        <Image
          source={{ uri: user?.profilePhoto || 'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png' }}
          style={styles(theme).avatar}
        />
      </TouchableOpacity>

      <View style={styles(theme).searchContainer}>
        <TextInput
          placeholder="Pesquisar"
          placeholderTextColor={theme.gray}
          style={styles(theme).searchInput}
        />
      </View>

      <TouchableOpacity
        style={styles(theme).bellContainer}
        onPress={() => {
          // Marca todas como lidas
          dispatch({ type: 'MARK_ALL_READ' });
          // Navega para a tela de notificações
          router.push('/(modals)/notifications');
        }}
      >
        <BellIcon size={32} color={theme.greenLight} />
        {notifications > 0 && (
          <View style={styles(theme).badge}>
            <Text style={styles(theme).badgeText}>{notifications}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 8,
      backgroundColor: theme.white,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.greenLight,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginHorizontal: 8,
      borderColor: theme.grayDetail,
    },
    searchInput: {
      flex: 1,
      height: 36,
      color: theme.black,
    },
    bellContainer: {
      padding: 0,
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: 4,
      right: 0,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.greenLight,
    },
    badgeText: {
      color: theme.white,
      fontSize: 10,
      fontWeight: 'bold',
    },
  });
