// app/notifications.tsx

import React from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { useNotifications } from '../contexts/NotificationContext';
import { Notification } from '../types/notification';
import { useTheme } from '@/hooks/useTheme';

export default function NotificationsModal() {
  const router = useRouter();
  const { state, markAllRead } = useNotifications();
  const theme = useTheme();

  // Ordena por data decrescente
  const items = state.items.slice().sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const now = new Date();

  // Agrupa por tempo
  const groups: Record<string, Notification[]> = {
    'Mais recentes': [],
    Ontem: [],
    'Últimos 30 dias': [],
  };

  items.forEach(item => {
    const diffMs = now.getTime() - new Date(item.date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) groups['Mais recentes'].push(item);
    else if (diffDays === 1) groups['Ontem'].push(item);
    else if (diffDays <= 30) groups['Últimos 30 dias'].push(item);
    else groups['Últimos 30 dias'].push(item);
  });

  const sections = Object.entries(groups)
    .map(([title, data]) => ({ title, data }))
    .filter(section => section.data.length > 0);

  const handleBack = () => {
    router.back();
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).topBar}>
        <TouchableOpacity onPress={handleBack} style={styles(theme).backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.black} />
        </TouchableOpacity>
        <Text style={styles(theme).title}>Notificações</Text>
        <TouchableOpacity onPress={handleMarkAllRead} style={styles(theme).markAllButton}>
          <Text style={styles(theme).markAllText}>Marcar todas</Text>
        </TouchableOpacity>
      </View>

      <SectionList<Notification>
        sections={sections}
        keyExtractor={(item, idx) => item.id || `notif-${idx}`}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles(theme).sectionHeader}>
            <Text style={styles(theme).sectionHeaderText}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={() => {}} />
        )}
        ItemSeparatorComponent={() => <View style={styles(theme).separator} />}
        ListEmptyComponent={() => (
          <View style={styles(theme).emptyContainer}>
            <Text style={styles(theme).emptyText}>Você não tem notificações</Text>
          </View>
        )}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles(theme).list}
      />
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.grayLight,
    },
    backButton: {
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      flex: 1,
      color: theme.black,
    },
    markAllButton: {
      padding: 8,
    },
    markAllText: {
      fontSize: 14,
      color: theme.greenLight,
    },
    list: {
      paddingBottom: 24,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#f0f0f0',
    },
    sectionHeaderText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    separator: {
      height: 1,
      backgroundColor: theme.grayLight,
      marginLeft: 72,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    emptyText: {
      fontSize: 14,
      color: theme.black,
    },
  });
