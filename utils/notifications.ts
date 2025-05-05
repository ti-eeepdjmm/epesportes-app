// utils/notifications.ts
import { FC } from 'react';

import CalendarIcon from '@/components/icons/CalendarIcon';
import BallIcon from '@/components/icons/BallIcon';
import MessagesIcon from '@/components/icons/MessagesIcon';

// 1) Quais tipos são pessoais
export const personalNotificationTypes = [
  'reaction',
  'comment',
  'mention',
  'follow',
] as const;

export type PersonalNotificationType = typeof personalNotificationTypes[number];

// 2) Quais tipos são globais
export const globalNotificationTypes = [
  'match',
  'event',
  'broadcast',
  'poll',
  'post',
  'goal',
] as const;
export type GlobalNotificationType = typeof globalNotificationTypes[number];

// 3) Union de NotificationType
export type NotificationType = PersonalNotificationType | GlobalNotificationType;

// 4) Guard para pessoais
export function isPersonal(type: NotificationType): type is PersonalNotificationType {
  return (personalNotificationTypes as readonly string[]).includes(type);
}

// 5) Configuração de ícones e mensagens para notificações globais
export const globalConfig: Record<
  GlobalNotificationType,
  {
    Icon: FC<{ size?: number; color?: string }>;
    renderMessage: (payload: any) => string;
  }
> = {
  match: {
    Icon: CalendarIcon,
    renderMessage: p =>
      p.teams && p.teams.team1 && p.teams.team2
        ? `Partida: ${p.teams.team1.name} ${p.teams.team1.score ?? 0} x ${p.teams.team2.score ?? 0} ${p.teams.team2.name}`
        : `Partida: ${p.message}` || 'Atualização de partida',
  },
  event: {
    Icon: CalendarIcon,
    renderMessage: p => p.title,
  },
  broadcast: {
    Icon: MessagesIcon,
    renderMessage: p => p.message,
  },
  poll: {
    Icon: MessagesIcon,
    renderMessage: p => p.title || p.message,
  },
  post: {
    Icon: MessagesIcon,
    renderMessage: p => p.title,
  },
  goal: {
    Icon: BallIcon,
    renderMessage: p => `GOOL! ${p.message}`,
  },
};
