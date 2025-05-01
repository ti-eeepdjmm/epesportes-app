// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
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
import api from '@/utils/api';
import { clearTokens } from '@/utils/storage';
import { Player, UserPreferences, UserProfile } from '@/types';

import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/utils/supabase';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut, user, updateUser } = useAuth();
  const { dispatch } = useNotifications();
  const { setTheme, theme: currentThemeKey } = useThemeContext();

  const [darkModeEnabled, setDarkModeEnabled] = useState(currentThemeKey === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);
  const [savingProfileLoading, setSavingProfileLoading] = useState(false);
  const [uploadingPhotoLoading, setUploadingPhotoLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>()

  useEffect(() => {
    async function loadPreferences() {
      try {
        setPrefLoading(true);
        const res = await api.get<UserPreferences>(`/user-preferences/user/${user?.id}`);
        setPreferences(res.data)
        setDarkModeEnabled(res.data.darkMode);
        setNotificationsEnabled(res.data.notificationsEnabled);
        setTheme(res.data.darkMode ? 'dark' : 'light');
      } catch (err) {
        const res = await api.post<UserPreferences>('/user-preferences/', {
          user: user?.id,
          darkMode: false,
          notificationsEnabled: false
        });
        setPreferences(res.data)
      } finally {
        setPrefLoading(false);
      }
    }
    if (user?.id) loadPreferences();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut();
      await clearTokens();
      setDarkModeEnabled(false);
      setNotificationsEnabled(false);
      setTheme('light');
      dispatch({ type: 'RESET' });
      router.replace('/(auth)/login');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível sair.');
    } finally {
      setLogoutLoading(false);
    }
  };

  // Novo método para editar foto de perfil
  const handleEditPhoto = async () => {
    try {
      // Pede permissão para a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Precisamos de acesso às fotos para alterar sua foto de perfil.'
        );
        return;
      }

      // Abre o seletor de imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      setUploadingPhotoLoading(true);

      const asset = result.assets[0];
      const uri = asset.uri;

      // Constrói nome de arquivo único para evitar stale content
      const fileExt = uri.split('.').pop();
      const timestamp = Date.now();
      const filePath = `${user?.id}/${timestamp}.${fileExt}`;

      // Faz upload para Supabase Storage com contentType
      const response = await fetch(uri);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, blob, { upsert: false });


      if (uploadError) {
        console.error('🛑 uploadError:', uploadError);
        Alert.alert('Erro no upload', uploadError.message);
        return;
      }

      // Obtém URL pública
      // Obtém URL pública
      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(uploadData.path);
      const publicUrl = urlData.publicUrl;



      // Atualiza registro do usuário
      const { data: updatedUser } = await api.patch(`/users/${user?.id}`, {
        profilePhoto: publicUrl,
      });
      updateUser(updatedUser);
    } catch (err) {
      console.error('🛑 uploadError:', err);
      Alert.alert(
        'Erro',
        'Não foi possível atualizar a foto de perfil.'
      );
    } finally {
      setUploadingPhotoLoading(false);
    }
  };

  const handleSaveProfile = async (profile: UserProfile) => {
    try {
      setSavingProfileLoading(true);
      const updatedUser = await api.patch(`/users/${user?.id}`, {
        name: profile.name,
        favoriteTeam: profile.favoriteTeam,
        username: profile.username,
      });

      if (user?.isAthlete) {
        const player = await api.get<Player>(`/players/user/${user?.id}`);
        await api.patch(`/players/${player.data.id}`, {
          team: profile.favoriteTeam,
          game: profile.gameId,
          position: profile.position || null,
          jerseyNumber: profile.jerseyNumber || null,
        });
      }
      updateUser(updatedUser.data);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setSavingProfileLoading(false);
      setEditing(false);
    }
  };

  return (
    <>
      <ScrollView style={{ backgroundColor: theme.white }} contentContainerStyle={{ paddingBottom: 40 }}>
        <StyledText style={[styles(theme).title, { fontSize: 24 }]}>Perfil</StyledText>
        <Separator />
        {user ? (
          <>
            <ProfileInfoCard user={user} onEditPhoto={handleEditPhoto} loading={uploadingPhotoLoading} />
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
            api.patch(`/user-preferences/${preferences!.id}`, { darkMode: val });
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
            api.patch(`/user-preferences/${preferences!.id}`, { notificationsEnabled: val });
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
      {!editing && (savingProfileLoading || logoutLoading || prefLoading) && (
        <View style={styles(theme).fullScreenLoader}>
          <AppLoader visible />
        </View>
      )}
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
    fullScreenLoader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.7)', // ou transparente se preferir
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
  });
