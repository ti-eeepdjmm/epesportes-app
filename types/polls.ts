import { User } from "./user";

export interface PollOption {
  id: number;
  label: string;
  image?: string;
  votes: { user: User }[]; // ou apenas `User[]` se preferir
}

export interface Poll {
  id: number;
  question: string;
  options: PollOption[];
}
