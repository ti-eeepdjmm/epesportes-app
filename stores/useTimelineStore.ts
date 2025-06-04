import { create } from 'zustand';
import api from '@/utils/api';
import { TimelinePostType, User } from '@/types';

interface TimelineState {
  posts: TimelinePostType[];
  users: Record<number, User>; // key: userId
  setPosts: (posts: TimelinePostType[]) => void;
  updatePost: (updated: TimelinePostType) => void;
  getUserById: (userId: number) => Promise<User | undefined>;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  posts: [],
  users: {},

  setPosts: async (posts) => {
    set({ posts });

    // Buscar usuários únicos
    const uniqueUserIds = Array.from(new Set(posts.map((p) => p.userId)));
    const usersMap: Record<number, User> = {};

    await Promise.all(
      uniqueUserIds.map(async (id) => {
        try {
          const { data } = await api.get<User>(`/users/${id}`);
          usersMap[id] = data;
        } catch (err) {
          console.warn(`Erro ao buscar user ${id}`, err);
        }
      }),
    );

    set((state) => ({
      users: { ...state.users, ...usersMap },
    }));
  },

  updatePost: (updated) =>
    set((state) => ({
      posts: state.posts.map((p) => (p._id === updated._id ? updated : p)),
    })),

  getUserById: async (userId) => {
    const existing = get().users[userId];
    if (existing) return existing;

    try {
      const { data } = await api.get<User>(`/users/${userId}`);
      set((state) => ({
        users: { ...state.users, [userId]: data },
      }));
      return data;
    } catch (err) {
      console.warn(`Erro ao buscar user ${userId}`, err);
      return undefined;
    }
  },
}));
