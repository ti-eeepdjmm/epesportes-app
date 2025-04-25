// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { AppLoader } from '@/components/AppLoader';
import { Separator } from '@/components/Separator';
import { StyledText } from '@/components/StyledText';
import { SettingToggle } from '@/components/SettingToggle';
import { MenuItem } from '@/components/MenuItem';
import LockIcon from '@/components/icons/LockIcon';
import LogoutIcon from '@/components/icons/LogoutIcon';
import BellIcon from '@/components/icons/BellPausedIcon';
import MoonIcon from '@/components/icons/MoonIcon';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import EditProfileForm from '@/components/profile/EditProfileForm';
import api from '@/utils/api';
import { clearTokens } from '@/utils/storage';
import { Player, UserPreferences, UserProfile } from '@/types';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut, user, updateUser } = useAuth();
  const { dispatch } = useNotifications();
  const { setTheme, theme: currentThemeKey } = useThemeContext();

  const [darkModeEnabled, setDarkModeEnabled] = useState(currentThemeKey === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await api.get<UserPreferences>(`/user-preferences/user/${user?.id}`);
        setDarkModeEnabled(res.data.darkMode);
        setNotificationsEnabled(res.data.notificationsEnabled);
        setTheme(res.data.darkMode ? 'dark' : 'light');
      } catch (err) {
        console.error('Erro ao carregar preferências', err);
      } finally {
        setPrefLoading(false);
        setLoading(false);
      }
    }
    if (user) loadPreferences();
  }, [user]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut();
      await clearTokens();
      dispatch({ type: 'RESET' });
      router.replace('/(auth)/login');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível sair.');
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleSaveProfile = async (profile: UserProfile) => {
    try {
      setLoading(true);
      const updatedUser = await api.patch(`/users/${user?.id}`, {
        name: profile.name,
        favoriteTeam: profile.favoriteTeam,
        username: profile.username,
      });
      if(user?.isAthlete){
        const player = await api.get<Player>(`/players/user/${user?.id}`);
        await api.patch(`/players/${player.data.id}`, {
           team: profile.favoriteTeam,
           game: profile.gameId,
           position: profile.position,
           jerseyNumber: profile.jerseyNumber,
        });
      }

      updateUser(updatedUser.data);
      setEditing(false);
      setLoading(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={{ backgroundColor: theme.white }} contentContainerStyle={{ paddingBottom: 40 }}>
        <StyledText style={[styles(theme).title, { fontSize: 24 }]}>Perfil</StyledText>
        <Separator />
        {user ? (
          <>
            <ProfileInfoCard user={user} onEditPhoto={() => { }} />
            <EditProfileForm
              user={user}
              onSave={handleSaveProfile}
              onCancel={() => setEditing(false)}
              isEditing={editing}
              setIsEditing={setEditing}
            />
          </>
        ) : null}

        <Separator />

        <StyledText style={styles(theme).title}>Aparência e Personalização</StyledText>
        <SettingToggle
          label="Modo Escuro"
          value={darkModeEnabled}
          onChange={(val) => {
            setDarkModeEnabled(val);
            setTheme(val ? 'dark' : 'light');
            api.patch(`/user-preferences`, { darkMode: val });
          }}
          icon={<MoonIcon size={24} color={theme.black} />}
        />
        <Separator />

        <StyledText style={styles(theme).title}>Notificações</StyledText>
        <SettingToggle
          label="Pausar notificações"
          value={notificationsEnabled}
          onChange={(val) => {
            setNotificationsEnabled(val);
            api.patch('/user-preferences', { notificationsEnabled: val });
          }}
          icon={<BellIcon size={24} color={theme.black} />}
        />
        <Separator />

        <StyledText style={styles(theme).title}>Segurança</StyledText>
        <MenuItem
          icon={<LockIcon size={24} color={theme.black} />}
          label="Alterar senha"
          onPress={() => router.push('/(auth)/reset-password')}
          showArrow
        />
        <Separator />

        <StyledText style={styles(theme).title}>Conta</StyledText>
        <MenuItem
          icon={<LogoutIcon size={24} color={theme.black} />}
          label="Sair"
          onPress={handleLogout}
          showArrow={false}
        />
      </ScrollView>
      <AppLoader visible={loading || logoutLoading || prefLoading} />
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
      fontSize: 18,
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
