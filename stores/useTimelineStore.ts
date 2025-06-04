// src/stores/useTimelineStore.ts
import { create } from 'zustand';
import api from '@/utils/api';
import { TimelinePostType, User } from '@/types';

interface TimelineState {
  posts: TimelinePostType[];
  users: Record<number, User>;
  isLoading: boolean;
  initialLoading: boolean;
  setInitialLoading: (value: boolean) => void;
  setPosts: (posts: TimelinePostType[]) => void;
  updatePost: (updated: TimelinePostType) => void;
  getUserById: (userId: number) => Promise<User | undefined>;
  fetchPosts: () => Promise<void>;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  posts: [],
  users: {},
  isLoading: false,
  initialLoading: true,

  setInitialLoading: (value) => set({ initialLoading: value }),

  setPosts: (posts) => {
    const sortedPosts = [...posts].sort(
      (a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime(),
    );
    set({ posts: sortedPosts });

    // Buscar usuários únicos após setar posts
    const uniqueUserIds = Array.from(new Set(posts.map((p) => p.userId)));
    const usersMap: Record<number, User> = {};

    Promise.all(
      uniqueUserIds.map(async (id) => {
        try {
          const { data } = await api.get<User>(`/users/${id}`);
          usersMap[id] = data;
        } catch (err) {
          console.warn(`Erro ao buscar user ${id}`, err);
        }
      }),
    ).then(() => {
      set((state) => ({
        users: { ...state.users, ...usersMap },
      }));
    });
  },

  updatePost: (updated) =>
    set((state) => {
      const updatedPosts = state.posts.map((p) =>
        p._id === updated._id ? updated : p,
      );
      updatedPosts.sort(
        (a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime(),
      );
      return { posts: updatedPosts };
    }),

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

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<TimelinePostType[]>('/timeline-posts');
      await get().setPosts(data);
    } catch (err) {
      console.warn('Erro ao buscar posts', err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
