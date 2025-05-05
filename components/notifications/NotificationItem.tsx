// components/notifications/NotificationItem.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Notification } from '@/types/notification';
import { relativeTime } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  notification: Notification;
  onPress: () => void;
}

// Tipos de payload do backend
interface PersonalPayload {
  type: 'reaction' | 'comment' | 'mention' | 'follow';
  message: string;
  link: string;
  sender: {
    id: number;
    name: string;
    avatar: string;
  };
  timestamp: number;
}
interface MatchUpdatePayload {
  matchId: number;
  type: 'scheduled' | 'kickoff' | 'goal' | 'halftime' | 'completed' | 'cancelled';
  title: string;
  message: string;
  teams: {
    team1: { name: string; logoUrl?: string; score?: number };
    team2: { name: string; logoUrl?: string; score?: number };
  };
  timestamp: number;
  extra?: any;
}
interface PollUpdatePayload {
  pollId: number;
  title: string;
  options: { id: number; option: string; votes: number }[];
  totalVotes: number;
  expiration: string;
  date: string;
}
interface GlobalPayload {
  type: 'match' | 'event' | 'broadcast' | 'poll' | 'post';
  title: string;
  message: string;
  link: string;
  timestamp: number;
  sender?: { id: number; name: string; avatar: string };
}

// Funções auxiliares para identificar payload
const isPersonalPayload = (p: any): p is PersonalPayload =>
  ['reaction', 'comment', 'mention', 'follow'].includes(p.type);
const isMatchPayload = (p: any): p is MatchUpdatePayload =>
  typeof p.matchId === 'number';
const isPollPayload = (p: any): p is PollUpdatePayload =>
  typeof p.pollId === 'number';
const isGlobalPayload = (p: any): p is GlobalPayload =>
  ['match', 'event', 'broadcast', 'poll', 'post'].includes(p.type as string);

export const NotificationItem: React.FC<Props> = ({ notification, onPress }) => {
  const payload = notification.payload as any;

  // 1) Notificações pessoais
  if (isPersonalPayload(payload)) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <Image source={{ uri: payload.sender.avatar }} style={styles.avatar} />
        <View style={styles.content}>
          <Text style={styles.message}>
            <Text style={styles.bold}>{payload.sender.name}</Text> {payload.message}
          </Text>
          <Text style={styles.time}>{relativeTime(payload.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // 2) Atualizações de partida
  if (isMatchPayload(payload)) {
    const { teams, type, message, timestamp } = payload;
    const iconName = type === 'goal' ? 'football' : 'calendar';
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <Ionicons name={iconName} size={32} />
        <View style={styles.content}>
          <Text style={styles.message}>
            {`${teams.team1.name} ${teams.team1.score || ''} x ${teams.team2.score || ''} ${teams.team2.name}`}
          </Text>
          <Text style={styles.subMessage}>{message}</Text>
          <Text style={styles.time}>{relativeTime(payload.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // 3) Atualizações de enquete
  if (isPollPayload(payload)) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <Ionicons name="pie-chart" size={32} />
        <View style={styles.content}>
          <Text style={styles.message}>{payload.title}</Text>
          <Text style={styles.subMessage}>{`Total de votos: ${payload.totalVotes}`}</Text>
          <Text style={styles.time}>{relativeTime(payload.date)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // 4) Notificações globais genéricas (event, broadcast, post)
  if (isGlobalPayload(payload)) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <Ionicons name="notifications" size={32} />
        <View style={styles.content}>
          <Text style={styles.message}>{payload.title}</Text>
          <Text style={styles.subMessage}>{payload.message}</Text>
          <Text style={styles.time}>{relativeTime(payload.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // 5) Fallback
  return null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  icon: {
    width: 32,
    height: 32,
  },
  content: {
    marginLeft: 12,
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#333',
  },
  subMessage: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
