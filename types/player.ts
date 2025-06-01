import { Game, Team, User } from "./user";

export interface PlayerRankingItem {
    id: number;
    player: {
            id: number;
            position: string;
            jerseyNumber: number;
    },
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
}

export interface PlayerResolved {
  id: number;
  name: string;
  photo: string;
  team: { name: string; logo: string };
  goals: number;
}