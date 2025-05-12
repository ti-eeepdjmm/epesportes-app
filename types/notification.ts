// types/notification.ts

// 1. Notificações pessoais (payload.type)
export const personalNotificationTypes = [
  'reaction',
  'comment',
  'mention',
  'follow',
] as const;
export type PersonalNotificationType = typeof personalNotificationTypes[number];

// 2. Notificações globais (payload.type)
export const globalNotificationTypes = [
  'match',
  'event',
  'broadcast',
  'poll',
  'post',
  'goal',
] as const;
export type GlobalNotificationType = typeof globalNotificationTypes[number];

// 3. Union final de NotificationType
export type NotificationType =
  | PersonalNotificationType
  | GlobalNotificationType;

// 4. Guarda de tipo
export function isPersonal(
  type: NotificationType
): type is PersonalNotificationType {
  return (personalNotificationTypes as readonly string[]).includes(type);
}

// 5. Formato da notificação no front
export interface Notification {
  id: string;
  type: NotificationType;     // reaction | comment | … | post
  message: string;
  link: string;
  date: string;               // ISO
  read: boolean;
  isGlobal: boolean;
  recipientId?: number;
  senderId?: number;
  payload:
    | {
        // payload de personalNotificationTypes
        sender: {
          id: number;
          name: string;
          avatar: string;
        };
        message: string;
        link: string;
        timestamp: number;
      }
    | {
        // payload de match_update
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
    | {
        // payload de poll
        pollId: number;
        title: string;
        options: { id: number; option: string; votes: number }[];
        totalVotes: number;
        expiration: string;
        date: string;
      }
    | {
        // payload genérico de event | broadcast | post
        type: 'match' | 'event' | 'broadcast' | 'poll' | 'post';
        title: string;
        message: string;
        link: string;
        timestamp: number;
        sender?: {
          id: number;
          name: string;
          avatar: string;
        };
      };
}
