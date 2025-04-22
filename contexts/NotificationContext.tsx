import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Notification, NotificationType } from '@/types';


// Estado interno
interface State {
  items: Notification[];
}

// Ações possíveis
type Action =
  | { type: 'RECEIVE'; notification: Notification }
  | { type: 'MARK_ALL_READ' }
  | { type: 'RESET' };

const initialState: State = { items: [] };

// Reducer para manter o histórico de notificações
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RECEIVE':
      return { items: [action.notification, ...state.items] };
    case 'MARK_ALL_READ':
      return { items: state.items.map(n => ({ ...n, read: true })) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Contexto e hook de acesso
const NotificationContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export const useNotifications = () => useContext(NotificationContext);

// Provider que encapsula a lógica de socket + fetch inicial + reset
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  // 1) Reset quando dé-loga
  useEffect(() => {
    if (!user) dispatch({ type: 'RESET' });
  }, [user]);

  // 2) Fetch inicial de notificações do backend
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get<Notification[]>('/notifications');
        res.data.forEach(n =>
          dispatch({ type: 'RECEIVE', notification: {
            id: n.id ?? n.date,
            type: n.type,
            payload: n,
            read: n.read,
            date: n.date,
            message: n.message,
          } })
        );
      } catch (err) {
        console.error('Erro ao carregar notificações', err);
      }
    })();
  }, [user]);

  // 3) Escuta eventos de socket para novas notificações
  useEffect(() => {
    if (!socket) return;

    const handler = (type: NotificationType) => (payload: any) => {
      dispatch({
        type: 'RECEIVE',
        notification: {
          id: Date.now().toString(),
          type,
          payload,
          read: false,
          date: new Date().toISOString(),
          message: payload.message,
        },
      });
    };

    socket.on('feed:new-post', handler('feed:new-post'));
    socket.on('match:update', handler('match:update'));
    socket.on('poll:update', handler('poll:update'));

    return () => {
      socket.off('feed:new-post');
      socket.off('match:update');
      socket.off('poll:update');
    };
  }, [socket]);

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
    </NotificationContext.Provider>
  );
};
