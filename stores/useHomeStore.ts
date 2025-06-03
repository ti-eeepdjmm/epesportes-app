import { create } from 'zustand';
import { MatchSummary, TeamStanding } from '@/types';
import { PlayerResolved } from '@/types/player';
import { Poll } from '@/types';

interface HomeStoreState {
  lastMatch: MatchSummary | null;
  nextMatch: MatchSummary | null;
  scorers: PlayerResolved[];
  standings: TeamStanding[];
  polls: Poll[];
  initialLoading: boolean;
  setLastMatch: (match: MatchSummary | null) => void;
  setNextMatch: (match: MatchSummary | null) => void;
  setScorers: (players: PlayerResolved[]) => void;
  setStandings: (standings: TeamStanding[]) => void;
  setPolls: (polls: Poll[]) => void;
  setInitialLoading: (loading: boolean) => void;
}

export const useHomeStore = create<HomeStoreState>((set) => ({
  lastMatch: null,
  nextMatch: null,
  scorers: [],
  standings: [],
  polls: [],
  initialLoading: true,
  setLastMatch: (match) => set({ lastMatch: match }),
  setNextMatch: (match) => set({ nextMatch: match }),
  setScorers: (players) => set({ scorers: players }),
  setStandings: (standings) => set({ standings }),
  setPolls: (polls) => set({ polls }),
  setInitialLoading: (loading) => set({ initialLoading: loading }),
}));
