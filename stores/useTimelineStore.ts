import { create } from 'zustand';
import api from '@/utils/api';
import { TimelinePostType, User } from '@/types';

interface TimelineState {
  posts: TimelinePostType[];
  users: Record<number, User>;
  isLoading: boolean;
  initialLoading: boolean;
  currentPage: number;
  totalPosts: number;
  hasMore: boolean;
  setInitialLoading: (value: boolean) => void;
  setPosts: (posts: TimelinePostType[]) => void;
  updatePost: (updated: TimelinePostType) => void;
  addPost: (newPost: TimelinePostType) => void;
  getUserById: (userId: number) => Promise<User | undefined>;
  fetchInitialPosts: () => Promise<void>;
  fetchMorePosts: () => Promise<void>;
  resetTimeline: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  posts: [],
  users: {},
  isLoading: false,
  initialLoading: true,
  currentPage: 1,
  totalPosts: 0,
  hasMore: true,

  setInitialLoading: (value) => set({ initialLoading: value }),

  setPosts: (posts) => {
    const sortedPosts = [...posts].sort(
      (a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime(),
    );
    set({ posts: sortedPosts });

    // Carrega usuários associados
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

  fetchInitialPosts: async () => {
    set({ isLoading: true, currentPage: 1 });

    try {
      const { data } = await api.get('/timeline-posts?page=1&limit=10');
      const posts = data.data;
      const total = data.total;

      set({
        posts,
        totalPosts: total,
        currentPage: 1,
        hasMore: posts.length < total,
      });

      await get().setPosts(posts);
    } catch (err) {
      console.warn('Erro ao buscar posts iniciais', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMorePosts: async () => {
    const { currentPage, posts, totalPosts } = get();
    const nextPage = currentPage + 1;

    try {
      const { data } = await api.get(`/timeline-posts?page=${nextPage}&limit=10`);
      const newPosts: TimelinePostType[] = data.data;

      const allPosts = [...posts, ...newPosts];
      const uniquePosts = Array.from(new Map(allPosts.map((p) => [p._id, p])).values());

      set({
        posts: uniquePosts,
        currentPage: nextPage,
        hasMore: uniquePosts.length < totalPosts,
      });

      await get().setPosts(uniquePosts);
    } catch (err) {
      console.warn('Erro ao carregar mais posts', err);
    }
  },

  addPost: (newPost) =>
    set((state) => ({
      posts: [newPost, ...state.posts].sort(
        (a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime(),
      ),
    })),

  resetTimeline: () => {
    set({
      // posts: [],
      currentPage: 1,
      totalPosts: 0,
      hasMore: true,
    });
  },
}));
