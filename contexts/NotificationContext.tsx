// contexts/NotificationContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      if (state.items.some(n => n.id === action.notification.id)) return state;
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
type ContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;
  markAllRead: () => Promise<void>;
};
const NotificationContext = createContext<ContextValue>({
  state: initialState,
  dispatch: () => {},
  markAllRead: async () => {}
});
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Função para limpar globais lidas localmente
  const markAllRead = async () => {
    const now = new Date().toISOString();
    await AsyncStorage.setItem('lastSeenGlobalAt', now);
    dispatch({ type: 'MARK_ALL_READ' });
  };

  // FETCH inicial: apenas quando user estiver disponível
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET' });
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        // 1) Carrega o timestamp de última visualização de globais
        const lastSeen = await AsyncStorage.getItem('lastSeenGlobalAt');
        const lastTs = lastSeen ? new Date(lastSeen) : new Date(0);

        // 2) Buscar notificações brutas
        const { data: rawNotifs } = await api.get<Notification[]>('/notifications');

        // 3) Enriquecer notificações pessoais
        const personalIds = rawNotifs
          .filter(n => !n.isGlobal && n.senderId)
          .map(n => n.senderId!) as number[];
        const uniqueUserIds = Array.from(new Set(personalIds));
        const users = await Promise.all(uniqueUserIds.map(id => api.get<User>(`/users/${id}`)));
        const usersMap: Record<number, User> = {};
        users.forEach(({ data }) => { usersMap[data.id] = data; });

        // 4) Enriquecer polls com título real
        const pollIds = rawNotifs
          .filter(n => n.isGlobal && n.type === 'poll')
          .map(n => {
            const m = n.link.match(/polls\/(.+)$/);
            return m ? m[1] : null;
          })
          .filter((id): id is string => !!id);
        const uniquePollIds = Array.from(new Set(pollIds));
        const pollDetails = await Promise.all(
          uniquePollIds.map(id => api.get<{ id: string; question: string }>(`/polls/${id}`))
        );
        const pollMap: Record<string, string> = {};
        pollDetails.forEach(({ data }) => { pollMap[data.id] = data.question; });

        // 5) Montar array de notificações enriquecidas + set read para globais
        const enriched = rawNotifs.map(n => {
          const base = {
            id: n.id,
            type: n.type,
            message: n.message,
            link: n.link,
            date: n.date,
            // sobrescreve apenas globais de acordo com lastSeen
            read: n.isGlobal ? new Date(n.date) <= lastTs : n.read,
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
          if (n.isGlobal && n.type === 'poll') {
            const match = n.link.match(/polls\/(.+)$/);
            const pollId = match ? match[1] : '';
            return {
              ...base,
              payload: {
                type: 'poll',
                title: pollMap[pollId] || n.message,
                message: n.message,
                link: n.link!,
                timestamp: +new Date(n.date),
              }
            } as Notification;
          }
          // globais padrão
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
        if (err.response?.status === 401) dispatch({ type: 'RESET' });
      }
    })();

    return () => { isMounted = false; };
  }, [user]);

  // WebSocket para novas notificações
  useEffect(() => {
    if (!socket || !user) return;

    // DEBUG: loga tudo que chega
    socket.onAny((event, payload) => {
      console.log('[NotificationProvider] evento recebido:', event, payload);
    });

    // handlers omitidos para brevidade (mantêm como antes)
    // Novo post
    socket.on('Feed:new-post', payload => {
      const notif: Notification = {
        id: payload.postId ? `${payload.postId}-${payload.timestamp}` : Date.now().toString(),
        type: 'post',
        message: payload.message || 'Novo post',
        link: payload.link || `/posts/${payload.postId}`,
        date: new Date().toISOString(),
        read: false,
        isGlobal: false,
        payload,
      };
      dispatch({ type: 'RECEIVE', notification: notif });
    });

    // Atualização de partida
    socket.on('Match:update', payload => {
      const notif: Notification = {
        id: `match-${payload.matchId}-${payload.timestamp}`,
        type: payload.type || 'match',
        message: payload.message || 'Partida atualizada',
        link: payload.link || `/matches/${payload.matchId}`,
        date: new Date().toISOString(),
        read: false,
        isGlobal: true,
        payload,
      };
      dispatch({ type: 'RECEIVE', notification: notif });
    });

    // Notificação global única (poll, event, broadcast, post)
    socket.on('global:notification', payload => {
      const globalType = payload.type as NotificationType;
      const notif: Notification = {
        id: payload.pollId ? `poll-${payload.pollId}-${payload.timestamp}` : Date.now().toString(),
        type: globalType,
        message: payload.message || payload.title || 'Atualização',
        link: payload.link,
        date: new Date().toISOString(),
        read: false,
        isGlobal: true,
        payload,
      };
      dispatch({ type: 'RECEIVE', notification: notif });
    });


    // Limpa listeners ao desmontar
    return () => {
      socket.offAny();
      socket.off('Feed:new-post');
      socket.off('Match:update');
      socket.off('global:notification');
    };
  }, [socket, user]);

  return (
    <NotificationContext.Provider value={{ state, dispatch, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
