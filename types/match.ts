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