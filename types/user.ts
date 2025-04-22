export interface User {
  id: number;
  authUserId: string;
  name: string;
  email: string;
  favoriteTeam: string | null;
  profilePhoto: string | null;
  isAthlete: boolean;
  birthDate: string | null;
  hasPasswordLogin: boolean;
}

export interface UserPreferences {
  darkMode: boolean;
  notificationsEnabled: boolean;
  userId: number;
}
