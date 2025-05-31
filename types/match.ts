// Tipagem mínima para o componente
export interface TeamInfo {
  id: number;
  name: string;
  logo: string; // pode ser URL de PNG/JPG ou SVG
}

export interface MatchSummary {
  id: number;
  game: game;
  dateTime: string; // ISO
  status: 'scheduled' | 'completed' | 'cancelled' | string;
  team1: TeamInfo;
  team2: TeamInfo;
  score_team1?: number;
  score_team2?: number;
}

export interface game{
  id: number;
  name: string;
  description: string;
  rules: string;
  created_at: string;
}

export interface LineupEntry {
  id: number;
  team: { id: number; name: string; logo: string };
  player: { id: number; position: string; jerseyNumber: number };
  starter: boolean;
}

export interface PlayerDetail {
  id: number;
  name: string;
  avatar: string;
  position: string;
  jerseyNumber: number;
  starter: boolean;
}

export interface LineupByTeam {
  teamId: number;
  teamName: string;
  teamLogo: string;
  starters: PlayerDetail[];
  reserves: PlayerDetail[];
}

export interface TeamStanding {
  team: TeamInfo;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
}