import { create } from 'zustand';
import api from '@/utils/api';
import { TimelinePostType, User } from '@/types';

interface TimelineState {
  posts: TimelinePostType[];
  users: Record<number, User>;
  setPosts: (posts: TimelinePostType[]) => void;
  updatePost: (updated: TimelinePostType) => void;
  getUserById: (userId: number) => Promise<User | undefined>;
  fetchPosts: () => Promise<void>; // 👈 nova função
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  posts: [],
  users: {},

  setPosts: (posts) => {
    const sortedPosts = [...posts].sort(
      (a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime(),
    );
    set({ posts: sortedPosts });
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
    try {
      const { data } = await api.get<TimelinePostType[]>('/timeline-posts');
      await get().setPosts(data); // já busca os users internamente
    } catch (err) {
      console.error('Erro ao buscar posts', err);
    }
  },
}));
