export interface User {
  id: number;
  authUserId: string;
  name: string;
  email: string;
  favoriteTeam: Team | null;
  profilePhoto: string | null;
  isAthlete: boolean;
  username: string;
  birthDate: string | null;
  hasPasswordLogin: boolean;
}

export interface UserPreferences {
  darkMode: boolean;
  notificationsEnabled: boolean;
  userId: number;
}

export interface Player{
  id: number;
  user: User;
  team: Team;
  game: Game;
  position: string | null;
  jerseyNumber: number | null;
}

export interface UserProfile{
  username: string | null;
  name: string;
  favoriteTeam: Team | null;
  profilePhoto: string;
  isAthlete: boolean;
  position: string | null;
  jerseyNumber: number | null;
  teamId: number | null;
  gameId: number | null;

}

export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface Game{
  id: number;
  name: string;
  description: string;
  rules: string;
}