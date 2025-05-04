// utils/notifications.ts

import { ImageSourcePropType } from 'react-native';
import {
  NotificationType,
  PersonalNotificationType,
  GlobalNotificationType,
} from '../types/notification';

// 1) Quais tipos são pessoais, conforme seu backend
export const personalNotificationTypes = [
  'reaction',
  'comment',
  'mention',
  'follow',
] as const;

// 2) Type guard para notificações pessoais
export function isPersonal(
  type: NotificationType
): type is PersonalNotificationType {
  return (personalNotificationTypes as readonly string[]).includes(type);
}

// 3) Configuração para notificações globais, conforme GlobalNotificationType
export const globalConfig: Record<
  GlobalNotificationType,
  {
    icon: ImageSourcePropType;
    renderMessage: (payload: any) => string;
  }
> = {
  match: {
    icon: require('../assets/icons/calendar.png'),
    renderMessage: (p) =>
      `Partida: ${p.teams.team1.name} ${p.teams.team1.score ?? 0} x ${p.teams.team2.score ??
        0} ${p.teams.team2.name}`,
  },
  event: {
    icon: require('../assets/icons/calendar.png'),
    renderMessage: (p) => p.title,
  },
  broadcast: {
    icon: require('../assets/icons/calendar.png'),
    renderMessage: (p) => p.message,
  },
  poll: {
    icon: require('../assets/icons/poll.png'),
    renderMessage: (p) => `Enquete: ${p.title}`,
  },
  post: {
    icon: require('../assets/icons/poll.png'),
    renderMessage: (p) => p.title,
  },
};
