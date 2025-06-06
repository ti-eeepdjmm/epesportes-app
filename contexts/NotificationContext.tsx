import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useState,
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

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { items: action.notifications };
    case 'RECEIVE':
      if (state.items.some((n) => n.id === action.notification.id)) return state;
      return { items: [action.notification, ...state.items] };
    case 'MARK_ALL_READ':
      return { items: state.items.map((n) => ({ ...n, read: true })) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const NotificationContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  markAllRead: () => Promise<void>;
  lastRoute: string | null;
  setLastRoute: React.Dispatch<React.SetStateAction<string | null>>;
}>({
  state: initialState,
  dispatch: () => {},
  markAllRead: async () => {},
  lastRoute: null,
  setLastRoute: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const [lastRoute, setLastRoute] = useState<string | null>(null);

  const markAllRead = async () => {
    const now = new Date().toISOString();
    await AsyncStorage.setItem('lastSeenGlobalAt', now);
    dispatch({ type: 'MARK_ALL_READ' });
  };

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET' });
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const lastSeen = await AsyncStorage.getItem('lastSeenGlobalAt');
        const lastTs = lastSeen ? new Date(lastSeen) : new Date(0);
        const { data: rawNotifs } = await api.get<Notification[]>('/notifications');

        const personalIds = rawNotifs.filter((n) => !n.isGlobal && n.senderId).map((n) => n.senderId!) as number[];
        const uniqueUserIds = Array.from(new Set(personalIds));
        const usersMap: Record<number, User> = {};

        await Promise.all(
          uniqueUserIds.map(async (id) => {
            try {
              const { data } = await api.get<User>(`/users/${id}`);
              usersMap[id] = data;
            } catch (err) {
              console.warn(`Falha ao buscar usuário ${id}`, err);
            }
          })
        );

        const pollIds = rawNotifs
          .filter((n) => n.isGlobal && n.type === 'poll')
          .map((n) => {
            const m = n.link.match(/polls\/(.+)$/);
            return m ? m[1] : null;
          })
          .filter((id): id is string => !!id);

        const uniquePollIds = Array.from(new Set(pollIds));
        const pollMap: Record<string, string> = {};

        await Promise.all(
          uniquePollIds.map(async (id) => {
            try {
              const { data } = await api.get<{ id: string; question: string }>(`/polls/${id}`);
              pollMap[id] = data.question;
            } catch (err) {
              console.warn(`Falha ao buscar enquete ${id}`, err);
              pollMap[id] = 'Enquete indisponível';
            }
          })
        );

        const enriched = rawNotifs.map((n) => {
          const base = {
            id: n.id,
            type: n.type,
            message: n.message,
            link: n.link,
            date: n.date,
            read: n.isGlobal ? new Date(n.date) <= lastTs : n.read,
            isGlobal: n.isGlobal,
          };

          if (!n.isGlobal && n.senderId) {
            const u = usersMap[n.senderId];
            if (!u) return null;
            return {
              ...base,
              payload: {
                sender: { id: u.id, name: u.name, avatar: u.profilePhoto },
                message: n.message,
                link: n.link!,
                timestamp: +new Date(n.date),
              },
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
              },
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
            },
          } as Notification;
        }).filter((n): n is Notification => n !== null);

        if (isMounted) dispatch({ type: 'LOAD', notifications: enriched });
      } catch (err: any) {
        console.error('fetchNotifications error:', err);
        if (err.response?.status === 401) dispatch({ type: 'RESET' });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.onAny((event, payload) => {
      console.log('[NotificationProvider] evento recebido:', event, payload);
    });

    // Postagens na timeline
    socket.on('feed:new-post', (payload) => {
      const notif: Notification = {
        id: payload.postId ? `post-${payload.postId}-${payload.timestamp}` : Date.now().toString(),
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

    // Atualizações de partidas
    socket.on('Match:update', (payload) => {
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

    // Notificações globais (como enquetes)
    socket.on('global:notification', (payload) => {
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

    // Notificações por menção
    socket.on('mention:notification', (payload) => {
      const notif: Notification = {
        id: `mention-${payload.userId}-${payload.timestamp}`,
        type: 'mention',
        message: payload.message || 'Você foi mencionado',
        link: payload.link,
        date: new Date().toISOString(),
        read: false,
        isGlobal: false,
        payload,
      };
      dispatch({ type: 'RECEIVE', notification: notif });
    });

    return () => {
      socket.offAny();
      socket.off('feed:new-post');
      socket.off('Match:update');
      socket.off('global:notification');
      socket.off('mention:notification');
    };
  }, [socket, user]);

  return (
    <NotificationContext.Provider value={{ state, dispatch, markAllRead, lastRoute, setLastRoute }}>
      {children}
    </NotificationContext.Provider>
  );
};
