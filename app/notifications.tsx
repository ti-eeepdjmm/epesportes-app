// app/notifications.tsx

import React from 'react';
import { SectionList, View, Text, StyleSheet } from 'react-native';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { useNotifications } from '../contexts/NotificationContext';
import { router } from 'expo-router';
import { Notification } from '../types/notification';

// Tipos pessoais do backend
const personalTypes = ['reaction', 'comment', 'mention', 'follow'] as const;

export default function NotificationsModal() {
  const { state, dispatch } = useNotifications();

  // Separar notificações pessoais e globais
  const personal = state.items.filter(
    n => personalTypes.includes((n.payload as any)?.type)
  );
  const globals = state.items.filter(
    n => !personalTypes.includes((n.payload as any)?.type)
  );

  const sections = [
    { title: 'Pessoais', data: personal },
    { title: 'Globais',  data: globals  },
  ];

  const handlePress = () => {
    dispatch({ type: 'MARK_ALL_READ' });
    router.back();
  };

  return (
    <SectionList<Notification>
      sections={sections}
      keyExtractor={(item, idx) => item.id ?? `notif-${idx}`}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.header}>
          <Text style={styles.headerText}>{title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <NotificationItem notification={item} onPress={handlePress} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você não tem notificações</Text>
        </View>
      )}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.list,
        { flexGrow: 1, justifyContent: state.items.length === 0 ? 'center' : 'flex-start' }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
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
    color: '#888',
  },
});
