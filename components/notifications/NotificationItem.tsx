// components/notifications/NotificationItem.tsx

import React, { FC } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Notification } from '@/types/notification';
import { relativeTime } from '@/utils/date';
import { isPersonal, globalConfig, getNotificationLabel } from '@/utils/notifications';
import { useTheme } from '@/hooks/useTheme';
import { RelativePathString, router } from 'expo-router';

interface Props {
  notification: Notification;
  onPress: () => void;
}

// Payload typings for personal notifications
interface PersonalPayload {
  sender: { id: number; name: string; avatar: string };
  message: string;
  link: string;
  timestamp: number;
}


export const NotificationItem: FC<Props> = ({ notification, onPress }) => {
  const theme = useTheme();
  const { payload } = notification as { payload: any };


  // Função para navegar
  const handlePress = () => {
    const path = notification.link.startsWith('/')
      ? notification.link
      : `/${notification.link}`;

    const finalPath = notification.link.split('/')[0] === 'matchs' ? `/matches/${notification.link.split('/')[1]}` : path;

    router.push(finalPath as RelativePathString);
  };

  // 1) Notificação pessoal
  if (isPersonal(notification.type)) {
    const personalPayload = payload as PersonalPayload;
    const { sender } = personalPayload;
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <Image
          source={{
            uri: sender.avatar || 'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png'
          }}
          style={styles.avatar}
        />
        <View style={styles.content}>
          <Text style={[styles.message, { color: theme.black }]}>
            <Text style={styles.bold}>{sender.name}</Text> {notification.message}
          </Text>
          <Text style={[styles.time, { color: theme.grayDetail }]}>
            {relativeTime(notification.date)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // 2) Notificação global
  const cfg = globalConfig[notification.type as keyof typeof globalConfig];
  if (cfg) {
    const { Icon, renderMessage } = cfg;
    const isPoll = notification.type === 'poll';
    const showSender = notification.type === 'post' && 'sender' in payload && payload.sender;

    return (
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        {showSender ? (
          <Image
            source={{
              uri:
                payload.sender.avatar ||
                'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png',
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.iconWrapper, { borderColor: theme.grayLight }]}>
            <Icon size={24} color={theme.greenLight} />
          </View>
        )}

        <View style={styles.content}>
          {showSender ? (
            <>
              <Text style={[styles.message, { color: theme.black }]}>
                <Text style={styles.bold}>{payload.sender.name}</Text> {renderMessage(payload)}
              </Text>
              <Text style={[styles.time, { color: theme.grayDetail }]}>
                {relativeTime(notification.date)}
              </Text>
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                {payload && (
                  <Text style={[styles.pollTitle, { color: theme.black }]}>
                    {isPoll ? 'Nova Enquete:' : getNotificationLabel(payload?.type)}{' '}
                  </Text>
                )}
                <Text style={[styles.message, { color: theme.black }]}>{renderMessage(payload)}</Text>
              </View>
              <Text style={[styles.time, { color: theme.gray }]}>{relativeTime(notification.date)}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }


  // 3) Fallback genérico
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <Text style={[styles.message, { color: theme.black }]}>{notification.message}</Text>
        <Text style={[styles.time, { color: theme.gray }]}>
          {relativeTime(notification.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    marginLeft: 12,
    flex: 1,
  },
  pollTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    marginTop: 4,
  },
});
