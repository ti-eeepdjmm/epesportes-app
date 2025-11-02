import { FC } from 'react';
import CalendarIcon from '@/components/icons/CalendarIcon';
import BallIcon from '@/components/icons/BallIcon';
import MessagesIcon from '@/components/icons/MessagesIcon';

// Tipos pessoais e globais
export const personalNotificationTypes = ['reaction', 'comment', 'mention', 'follow'] as const;
export type PersonalNotificationType = typeof personalNotificationTypes[number];

export const globalNotificationTypes = ['match', 'event', 'broadcast', 'poll', 'post', 'goal', 'completed'] as const;
export type GlobalNotificationType = typeof globalNotificationTypes[number];

// Tipo geral
export type NotificationType = PersonalNotificationType | GlobalNotificationType;

// Labels
export const typeLabels: Record<NotificationType, string> = {
  reaction: 'Reação:',
  comment: 'Comentário:',
  mention: 'Menção:',
  follow: 'Novo Seguidor:',
  match: 'Nova Partida:',
  event: 'Evento:',
  broadcast: 'Anúncio:',
  poll: 'Enquete:',
  post: 'Postagem:',
  goal: 'Gool!',
  completed: 'Fim de jogo!',
};

export function getNotificationLabel(type: unknown): string {
  if (typeof type === 'string' && type in typeLabels) {
    return typeLabels[type as NotificationType];
  }
  return 'Notificação';
}

// Checagem otimizada
const personalTypesSet = new Set<NotificationType>(personalNotificationTypes);

export function isPersonal(type: NotificationType): type is PersonalNotificationType {
  return personalTypesSet.has(type);
}

// Configurações visuais de notificações globais
export const globalConfig: Record<
  GlobalNotificationType,
  {
    Icon: FC<{ size?: number; color?: string }>;
    renderMessage: (payload: unknown) => string;
  }
> = {
  match: {
    Icon: CalendarIcon,
    renderMessage: (p: any) =>
      p?.teams?.team1 && p?.teams?.team2
        ? `${p.teams.team1.name} ${p.teams.team1.score ?? 0} x ${p.teams.team2.score ?? 0} ${p.teams.team2.name}`
        : p?.message || 'Atualização de partida',
  },
  event: {
    Icon: CalendarIcon,
    renderMessage: (p: any) => p?.title || 'Evento',
  },
  broadcast: {
    Icon: MessagesIcon,
    renderMessage: (p: any) => p?.message || 'Anúncio',
  },
  poll: {
    Icon: MessagesIcon,
    renderMessage: (p: any) =>
      p?.message === 'Enquete Finalizada!'
        ? `${p?.title || 'Enquete'} Veja o resultado.`
        : `${p?.title || 'Enquete'} Vote agora!`,
  },
  post: {
    Icon: MessagesIcon,
    renderMessage: (p: any) =>
      p?.sender?.name
        ? `${p.sender.name} postou uma resenha`
        : p?.title || 'Nova postagem',
  },
  goal: {
    Icon: BallIcon,
    renderMessage: (p: any) => p?.message || 'Gol marcado!',
  },
  completed: {
    Icon: CalendarIcon,
    renderMessage: (p: any) => p?.message || 'Partida encerrada',
  },
};
