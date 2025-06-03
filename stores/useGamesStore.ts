import { create } from 'zustand';
import api from '@/utils/api';
import { MatchSummary, TeamStanding } from '@/types';
import { PlayerRankingItem, PlayerResolved } from '@/types/player';

interface GamesStore {
  matches: MatchSummary[];
  scorers: PlayerResolved[];
  standings: TeamStanding[];
  initialLoading: boolean;
  refreshing: boolean;
  currentRound: number;
  currentMatchIndex: number;
  loadAll: () => Promise<void>;
  onRefresh: () => Promise<void>;
  handlePrev: () => void;
  handleNext: () => void;
  setRoundIndex: (index: number) => void;
  setMatchIndex: (index: number) => void;
}

export const useGamesStore = create<GamesStore>((set, get) => ({
  matches: [],
  scorers: [],
  standings: [],
  initialLoading: true,
  refreshing: false,
  currentRound: 0,
  currentMatchIndex: 0,

  loadAll: async () => {
  const isFirstLoad = get().matches.length === 0;
  if (isFirstLoad) set({ initialLoading: true });

  try {
    const [matchesRes, scorersRes, standingsRes] = await Promise.all([
      api.get<MatchSummary[]>('/matches'),
      api.get<PlayerRankingItem[]>('/rankings/goals'),
      api.get<TeamStanding[]>('/team-standings/ordered'),
    ]);

    const matches = matchesRes.data.reverse();

    const topPlayers = scorersRes.data.slice(0, 3);
    const resolvedPlayers = await Promise.all(
      topPlayers.map(async (item) => {
        const res = await api.get(`/players/${item.player.id}`);
        const player = res.data;

        return {
          id: player.id,
          name: player.user.name,
          photo:
            player.user.profilePhoto ||
            'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png',
          team: {
            name: player.team.name,
            logo: player.team.logo,
          },
          goals: item.goals,
        };
      })
    );

    set({
      matches,
      scorers: resolvedPlayers,
      standings: standingsRes.data,
    });
  } catch (err) {
    console.error('Erro ao carregar dados de Games:', err);
  } finally {
    set({ initialLoading: false });
  }
},

  onRefresh: async () => {
    set({ refreshing: true });
    await get().loadAll();
    set({ refreshing: false });
  },

  handlePrev: () => {
    const { currentRound, currentMatchIndex, matches, setRoundIndex, setMatchIndex } = get();
    const grouped = groupMatches(matches);

    if (currentMatchIndex > 0) {
      set({ currentMatchIndex: currentMatchIndex - 1 });
    } else if (currentRound > 0) {
      const prevRound = currentRound - 1;
      set({
        currentRound: prevRound,
        currentMatchIndex: grouped[prevRound].length - 1,
      });
    }
  },

  handleNext: () => {
    const { currentRound, currentMatchIndex, matches } = get();
    const grouped = groupMatches(matches);
    const currentRoundMatches = grouped[currentRound] || [];

    if (currentMatchIndex < currentRoundMatches.length - 1) {
      set({ currentMatchIndex: currentMatchIndex + 1 });
    } else if (currentRound < grouped.length - 1) {
      set({
        currentRound: currentRound + 1,
        currentMatchIndex: 0,
      });
    }
  },

  setRoundIndex: (index) => {
    const { matches } = get();
    const grouped = groupMatches(matches);
    const safeIndex = Math.max(0, Math.min(index, grouped.length - 1));
    set({ currentRound: safeIndex, currentMatchIndex: 0 });
  },

  setMatchIndex: (index) => {
    const { matches, currentRound } = get();
    const grouped = groupMatches(matches);
    const roundMatches = grouped[currentRound] || [];
    const safeIndex = Math.max(0, Math.min(index, roundMatches.length - 1));
    set({ currentMatchIndex: safeIndex });
  },
}));

function groupMatches(matches: MatchSummary[]): MatchSummary[][] {
  return matches.reduce((acc: MatchSummary[][], match, index) => {
    const groupIndex = Math.floor(index / 5);
    if (!acc[groupIndex]) acc[groupIndex] = [];
    acc[groupIndex].push(match);
    return acc;
  }, []);
}
