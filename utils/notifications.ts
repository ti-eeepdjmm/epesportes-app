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
  'completed',
] as const;
export type GlobalNotificationType = typeof globalNotificationTypes[number];

export const typeLabels = {
  reaction: 'Reação:',
  comment: 'Comentário:',
  match: 'Nova Partida:',
  poll: 'Enquete:',
  post: 'Postagem:',
  goal: 'Gool!',
  mention: 'Menção:',
  follow: 'Novo Seguidor:',
  event: 'Evento:',
  broadcast: 'Anúncio:',
  completed: 'Fim de jogo!',
} satisfies Record<NotificationType, string>;

export function getNotificationLabel(type: unknown): string {
  if (typeof type !== 'string') return 'Notificação';

  if (type in typeLabels) {
    return typeLabels[type as NotificationType];
  }

  return 'Notificação';
}

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
        ? `${p.teams.team1.name} ${p.teams.team1.score ?? 0} x ${p.teams.team2.score ?? 0} ${p.teams.team2.name}`
        : `${p.message}` || 'Atualização de partida',
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
    renderMessage: p => p.message == 'Enquete Finalizada!' ? `${p.title} Veja o resultado.` : p.title,
  },
  post: {
    Icon: MessagesIcon,
    renderMessage: p => p.title,
  },
  goal: {
    Icon: BallIcon,
    renderMessage: p => p.message,
  },
  completed: {
    Icon: CalendarIcon,
    renderMessage: p => p.message,
  }
};
