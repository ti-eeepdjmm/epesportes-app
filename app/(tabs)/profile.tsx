import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingToggle } from '@/components/SettingToggle';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import MoonIcon from '@/components/icons/MoonIcon';
import BellIcon from '@/components/icons/BellPausedIcon';
import LogoutIcon from '@/components/icons/LogoutIcon';
import LockIcon from '@/components/icons/LockIcon';
import { Separator } from '@/components/Separator';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { clearTokens } from '@/utils/storage';
import { MenuItem } from '@/components/MenuItem';
import { AppLoader } from '@/components/AppLoader';
import { UserPreferences } from '@/types';

export default function Profile() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { setTheme, theme: currentThemeKey } = useThemeContext();

  // estado de preferências
  const [darkModeEnabled, setDarkModeEnabled] = useState(currentThemeKey === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // // carrega preferências do usuário ao montar
  // useEffect(() => {
  //   async function loadPreferences() {
  //     try {
  //       const response = await api.get<UserPreferences>(`/user-preferences/user/${user!.id}`);//alterar backend!!!!!!
  //       const { userId, darkMode, notificationsEnabled } = response.data;
  //       setUserPreferences({ darkMode, notificationsEnabled, userId });
  //       console.log('Preferências carregadas:', response.data);
  //     } catch (err) {
  //       const { userId, darkMode, notificationsEnabled } = await createPreferences({ darkMode: false, notificationsEnabled: true, userId: user!.id });
  //       setUserPreferences({ darkMode, notificationsEnabled, userId });
  //     } finally {
  //       setPrefLoading(false);
  //     }
  //   }
  //   loadPreferences();
  // }, []);

  // atualiza preferências via API
  const setUserPreferences = (preferences: UserPreferences) => {
    setDarkModeEnabled(preferences.darkMode);
    setNotificationsEnabled(preferences.notificationsEnabled);
    // aplica tema de acordo
    setTheme(preferences.darkMode ? 'dark' : 'light');
  }

  const updatePreferences = async (updates: Partial<UserPreferences>): Promise<UserPreferences | any > => {
    try {
      return await api.patch<UserPreferences>('/user-preferences', updates);
    } catch (err) {
      console.error('Erro ao atualizar preferências', err);
      Alert.alert('Erro', 'Não foi possível atualizar suas preferências.');
    }
  };

  const createPreferences = async (preferences:UserPreferences): Promise<UserPreferences | any > => {
    try {
      return await api.post<UserPreferences>('/user-preferences', preferences);
    } catch (err) {
      console.error('Erro ao criar preferências', err);
      Alert.alert('Erro', 'Não foi possível salvar suas preferências.');
    }
  };

  const handleToggleDarkMode = (value: boolean) => {
    setDarkModeEnabled(value);
    setTheme(value ? 'dark' : 'light');
    updatePreferences({ darkMode: value });
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    updatePreferences({ notificationsEnabled: value });
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut();
      await clearTokens();
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Erro ao fazer logout', err);
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    } finally {
      setLogoutLoading(false);
    }
  };

  const loading = prefLoading || logoutLoading;

  return (
    <>
      <ScrollView
        style={styles(theme).container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <StyledText style={styles(theme).title}>Perfil</StyledText>
        <Separator />

        <StyledText style={styles(theme).subtitle}>Informações do Usuário</StyledText>
        {/* TODO: Exibir dados do usuário aqui */}
        <Separator />

        <StyledText style={styles(theme).subtitle}>Aparência e Personalização</StyledText>
        <SettingToggle
          label="Modo Escuro"
          value={darkModeEnabled}
          onChange={handleToggleDarkMode}
          icon={<MoonIcon size={24} color={theme.black} />}
        />
        <Separator />

        <StyledText style={styles(theme).subtitle}>Notificações</StyledText>
        <SettingToggle
          label="Pausar notificações"
          value={notificationsEnabled}
          onChange={handleToggleNotifications}
          icon={<BellIcon size={24} color={theme.black} />}
        />
        <Separator />

        <StyledText style={styles(theme).subtitle}>Segurança e Privacidade</StyledText>
        <MenuItem
          icon={<LockIcon size={24} color={theme.black} />}
          label="Alterar senha"
          onPress={() => router.push('/(auth)/reset-password')}
          showArrow
        />
        <Separator />

        <StyledText style={styles(theme).subtitle}>Conta e Gerenciamento</StyledText>
        <MenuItem
          icon={<LogoutIcon size={24} color={theme.black} />}
          label="Sair"
          onPress={handleLogout}
          showArrow={false}
        />
      </ScrollView>
      <AppLoader visible={loading} />
    </>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.white,
      paddingTop: 24,
      paddingBottom: 72,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Poppins_600SemiBold',
      color: theme.black,
      paddingHorizontal: 16,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Poppins_600SemiBold',
      color: theme.black,
      paddingHorizontal: 16,
    },
  });
