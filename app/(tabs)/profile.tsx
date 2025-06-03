// src/screens/ProfileScreen.tsx
import React, { useEffect } from 'react';
import { ScrollView, Alert, StyleSheet, View } from 'react-native';
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
import { useProfileStore } from '@/stores/useProfileStore';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut, user, updateUser } = useAuth();
  const { markAllRead } = useNotifications();
  const { setTheme, theme: currentTheme } = useThemeContext();
  const { hasLoadedOnce } = useProfileStore();

  const {
    preferences,
    editing,
    loading,
    savingProfileLoading,
    uploadingPhotoLoading,
    logoutLoading,
    darkModeEnabled,
    notificationsEnabled,
    loadPreferences,
    handleEditPhoto,
    handleSaveProfile,
    toggleDarkMode,
    toggleNotifications,
    setEditing,
    setLogoutLoading,
    reset,
  } = useProfileStore();


  useEffect(() => {
    if (user?.id && !hasLoadedOnce) {
      loadPreferences(user.id);
    }
  }, [user?.id, hasLoadedOnce]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut();
      markAllRead();
      router.replace('/(auth)/login');
    } catch {
      Alert.alert('Erro', 'Não foi possível sair.');
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading && !preferences) {
    return (
      <View style={styles(theme).loader}>
        <AppLoader visible />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={{ backgroundColor: theme.white }} contentContainerStyle={{ paddingBottom: 40 }}>
        <StyledText style={[styles(theme).title, { fontSize: 24 }]}>Perfil</StyledText>
        <Separator />

        {user && (
          <>
            <ProfileInfoCard
              user={user}
              onEditPhoto={() => handleEditPhoto(user)}
              loading={uploadingPhotoLoading}
            />
            <EditProfileForm
              user={user}
              onSave={(data) => handleSaveProfile(user, data)}
              onCancel={() => setEditing(false)}
              isEditing={editing}
              setIsEditing={setEditing}
            />
          </>
        )}

        <Separator />

        <StyledText style={styles(theme).title}>Aparência e Personalização</StyledText>
        <SettingToggle
          label="Modo Escuro"
          value={darkModeEnabled}
          onChange={(val) => {
            if (preferences?.id) {
              toggleDarkMode(val, preferences.id, setTheme);
            }
          }}
          icon={<MoonIcon size={24} color={theme.black} />}
        />

        <Separator />

        <StyledText style={styles(theme).title}>Notificações</StyledText>
        <SettingToggle
          label="Pausar notificações"
          value={notificationsEnabled}
          onChange={(val) => {
            if (preferences?.id) {
              toggleNotifications(val, preferences.id);
            }
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

      {!editing && (savingProfileLoading || logoutLoading) && (
        <View style={styles(theme).fullScreenLoader}>
          <AppLoader visible />
        </View>
      )}
    </>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    title: {
      fontSize: 18,
      fontFamily: 'Poppins_600SemiBold',
      color: theme.black,
      paddingHorizontal: 16,
    },
    loader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullScreenLoader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
  });
