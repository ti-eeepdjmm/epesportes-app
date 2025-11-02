// src/stores/useAthleteStore.ts
import { create } from 'zustand';
import api from '@/utils/api';
import { Game, Team, Player } from '@/types';

interface AthleteStore {
  games: { label: string; value: string }[];
  teams: { label: string; value: string }[];
  player: Player | null;
  hasLoadedOnce: boolean;
  loading: boolean;
  loadData: (userId: number, isAthlete: boolean) => Promise<void>;
  reset: () => void;
}

export const useAthleteStore = create<AthleteStore>((set) => ({
  games: [],
  teams: [],
  player: null,
  hasLoadedOnce: false,
  loading: false,

  loadData: async (userId: number, isAthlete: boolean) => {
    set({ loading: true });

    try {
      const [gamesRes, teamsRes] = await Promise.all([
        api.get<Game[]>('/games'),
        api.get<Team[]>('/teams'),
      ]);

      const games = gamesRes.data.map((g) => ({
        label: g.name,
        value: String(g.id),
      }));

      const teams = teamsRes.data.map((t) => ({
        label: t.name,
        value: String(t.id),
      }));

      let player: Player | null = null;
      if (isAthlete) {
        const playerRes = await api.get<Player>(`/players/user/${userId}`);
        player = playerRes.data;
      }

      set({
        games,
        teams,
        player,
        hasLoadedOnce: true,
      });
    } catch (err) {
      console.error('Erro ao carregar dados do atleta:', err);
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set({
    games: [],
    teams: [],
    player: null,
    hasLoadedOnce: false,
    loading: false,
  }),
}));
