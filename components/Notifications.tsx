import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/hooks/useTheme';

// Helper simples para formatar "tempo atrás" em pt
function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
}

export default function Notifications() {
  const theme = useTheme();
  const router = useRouter();
  const { state, dispatch } = useNotifications();
  const { items } = state;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles(item.read, theme).itemContainer}>
      <Image
        source={{ uri: item.payload.senderPhotoUrl ?? '' }}
        style={styles(item.read, theme).avatar}
      />
      <View style={styles(item.read, theme).textWrapper}>
        <Text style={styles(item.read, theme).message}>{item.message}</Text>
        <Text style={styles(item.read, theme).time}>{timeAgo(item.date)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles(false, theme).container}>
      {/* Header */}
      <View style={styles(false, theme).header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles(false, theme).backArrow, { color: theme.black }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles(false, theme).headerTitle, { color: theme.black }]}>Notificações</Text>
      </View>

      {/* Lista de notificações */}
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles(false, theme).separator} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = (read: boolean, theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backArrow: {
      fontSize: 24,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: read ? theme.surface : theme.white,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    textWrapper: {
      flex: 1,
    },
    message: {
      fontSize: 16,
      color: theme.text,
    },
    time: {
      fontSize: 12,
      color: theme.subtext,
      marginTop: 4,
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
      marginLeft: 68,
    },
  });
