// src/stores/useProfileStore.ts
import { create } from 'zustand';
import api from '@/utils/api';
import { Alert } from 'react-native';
import { getAccessToken } from '@/utils/storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/utils/supabase';
import { Player, UserPreferences, UserProfile, User } from '@/types';
import { ThemeType } from '@/contexts/ThemeContext';
import { useAthleteStore } from './useAthleteStore';

interface ProfileStore {
  preferences: UserPreferences | null;
  loading: boolean;
  savingProfileLoading: boolean;
  uploadingPhotoLoading: boolean;
  logoutLoading: boolean;
  editing: boolean;
  darkModeEnabled: boolean;
  notificationsEnabled: boolean;
  hasLoadedOnce: boolean;

  loadPreferences: (userId: number) => Promise<void>;
  handleEditPhoto: (user: User, updateUser: (user: User) => void) => Promise<void>;
  handleSaveProfile: (user: User, data: UserProfile, updateUser: (user: User) => void) => Promise<void>;
  toggleDarkMode: (val: boolean, prefId: number, setTheme: (theme: ThemeType) => void) => void;
  toggleNotifications: (val: boolean, prefId: number) => void;
  setEditing: (val: boolean) => void;
  setLogoutLoading: (val: boolean) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  preferences: null,
  loading: false, // ⚠️ Não comece com true para não forçar o AppLoader
  savingProfileLoading: false,
  uploadingPhotoLoading: false,
  logoutLoading: false,
  editing: false,
  darkModeEnabled: false,
  notificationsEnabled: false,
  hasLoadedOnce: false,

  loadPreferences: async (userId: number) => {
    const { preferences, hasLoadedOnce } = get();
    if (hasLoadedOnce && preferences?.id === userId) return;

    set({ loading: true });
    try {
      const res = await api.get<UserPreferences>(`/user-preferences/user/${userId}`);
      set({
        preferences: res.data,
        darkModeEnabled: res.data.darkMode,
        notificationsEnabled: res.data.notificationsEnabled,
        hasLoadedOnce: true,
      });
    } catch {
      const res = await api.post<UserPreferences>('/user-preferences/', {
        user: userId,
        darkMode: false,
        notificationsEnabled: false,
      });
      set({
        preferences: res.data,
        darkModeEnabled: false,
        notificationsEnabled: false,
        hasLoadedOnce: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  toggleDarkMode: (val, prefId, setTheme) => {
    // Otimista
    set({ darkModeEnabled: val });
    setTheme(val ? 'dark' : 'light');

    api.patch(`/user-preferences/${prefId}`, { darkMode: val }).catch(() => {
      Alert.alert('Erro', 'Não foi possível atualizar o modo escuro.');
    });
  },

  toggleNotifications: (val, prefId) => {
    set({ notificationsEnabled: val });

    api.patch(`/user-preferences/${prefId}`, { notificationsEnabled: val }).catch(() => {
      Alert.alert('Erro', 'Não foi possível atualizar as notificações.');
    });
  },

  handleEditPhoto: async (user, updateUser) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso às fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled) return;

      set({ uploadingPhotoLoading: true });

      const asset = result.assets[0];
      const uri = asset.uri;
      const ext = uri.split('.').pop() || 'jpeg';
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}.${ext}`;
      const contentType = `image/${ext}`;

      const token = await getAccessToken();

      await FileSystem.uploadAsync(
        `https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/avatars/${filePath}?upsert=true`,
        uri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': contentType,
          },
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        }
      );

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const { data:updatedUser }  = await api.patch<User>(`/users/${user.id}`, { profilePhoto: publicUrl });
      updateUser(updatedUser);
    } catch (err) {
      console.error('Erro ao editar foto:', err);
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
    } finally {
      set({ uploadingPhotoLoading: false });
    }
  },

  handleSaveProfile: async (user, data, updateUser: (user: User) => void) => {
    try {
      set({ savingProfileLoading: true });

      const { data:updatedUser } = await api.patch<User>(`/users/${user.id}`, {
        name: data.name,
        username: data.username,
        favoriteTeam: data.favoriteTeam,
      });
      
      if (user.isAthlete) {
        const player = await api.get<Player>(`/players/user/${user.id}`);
        await api.patch(`/players/${player.data.id}`, {
          team: data.favoriteTeam,
          game: data.gameId,
          position: data.position || null,
          jerseyNumber: data.jerseyNumber || null,
        });

        const athleteStore = useAthleteStore.getState();
        await athleteStore.loadData(user.id, user.isAthlete);
      }

      updateUser(updatedUser);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      set({ savingProfileLoading: false, editing: false });
    }
  },

  setEditing: (val) => set({ editing: val }),
  setLogoutLoading: (val) => set({ logoutLoading: val }),

  reset: () =>
    set({
      preferences: null,
      loading: false,
      savingProfileLoading: false,
      uploadingPhotoLoading: false,
      logoutLoading: false,
      editing: false,
      darkModeEnabled: false,
      notificationsEnabled: false,
      hasLoadedOnce: false, // só aqui resetamos o carregamento
    }),
}));
