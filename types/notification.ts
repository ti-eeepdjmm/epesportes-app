export type NotificationType =
  | 'feed:new-post'
  | 'match:update'
  | 'poll:update';

// Shape de cada notificação no front
export interface Notification {
  id: string;
  type: NotificationType;
  payload: any;
  read: boolean;
  date: string;
  message?: string;
}