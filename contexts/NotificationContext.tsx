// contexts/NotificationContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode
} from 'react';
import { useSocket } from './SocketContext';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Notification, NotificationType, User } from '@/types';

// Estado interno
type State = { items: Notification[] };

// Ações possíveis
type Action =
  | { type: 'LOAD'; notifications: Notification[] }
  | { type: 'RECEIVE'; notification: Notification }
  | { type: 'MARK_ALL_READ' }
  | { type: 'RESET' };

const initialState: State = { items: [] };

// Reducer para notificações
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { items: action.notifications };
    case 'RECEIVE':
      if (state.items.some(n => n.id === action.notification.id)) {
        return state;
      }
      return { items: [action.notification, ...state.items] };
    case 'MARK_ALL_READ':
      return { items: state.items.map(n => ({ ...n, read: true })) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Contexto
const NotificationContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  // FETCH inicial: apenas quando user estiver disponível
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET' });
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const { data: rawNotifs } = await api.get<Notification[]>('/notifications');

        // Enriquecer payloads pessoais
        const personalIds = rawNotifs
          .filter(n => !n.isGlobal && n.senderId)
          .map(n => n.senderId!) as number[];
        const uniqueIds = Array.from(new Set(personalIds));

        const users = await Promise.all(
          uniqueIds.map(id => api.get<User>(`/users/${id}`))
        );
        const usersMap: Record<number, User> = {};
        users.forEach(({ data }) => { usersMap[data.id] = data; });

        const enriched = rawNotifs.map(n => {
          const base = {
            id: n.id,
            type: n.type,
            message: n.message,
            link: n.link,
            date: n.date,
            read: n.read,
            isGlobal: n.isGlobal,
          };
          if (!n.isGlobal && n.senderId) {
            const u = usersMap[n.senderId];
            return {
              ...base,
              payload: {
                sender: { id: u.id, name: u.name, avatar: u.profilePhoto },
                message: n.message,
                link: n.link!,
                timestamp: +new Date(n.date),
              }
            } as Notification;
          }
          return {
            ...base,
            payload: {
              type: n.type,
              title: n.message,
              message: n.message,
              link: n.link!,
              timestamp: +new Date(n.date),
            }
          } as Notification;
        });

        if (isMounted) dispatch({ type: 'LOAD', notifications: enriched });
      } catch (err: any) {
        console.error('fetchNotifications error:', err);
        // Se 401, apenas resetar estado de notificações
        if (err.response?.status === 401) {
          dispatch({ type: 'RESET' });
        }
      }
    })();

    return () => { isMounted = false; };
  }, [user]);

  // WebSocket para novas notificações
  useEffect(() => {
    if (!socket || !user) return;

    const handler = (type: NotificationType) => (payload: any) => {
      const notif: Notification = {
        id: payload.id ?? Date.now().toString(),
        type,
        message: payload.message,
        link: payload.link,
        date: new Date().toISOString(),
        read: false,
        isGlobal: payload.isGlobal ?? false,
        payload,
      };
      dispatch({ type: 'RECEIVE', notification: notif });
    };

    socket.on('feed:new-post', handler('post'));
    socket.on('match:update',   handler('match'));
    socket.on('poll:update',    handler('poll'));

    return () => {
      socket.off('feed:new-post');
      socket.off('match:update');
      socket.off('poll:update');
    };
  }, [socket, user]);

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
    </NotificationContext.Provider>
  );
};
