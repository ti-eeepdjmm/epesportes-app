import { User } from "./user";

export interface PollOption {
  value: string;
  label: string;
  image?: string;
  userVotes: number[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  expiration: string;
  avatarsByOption: Record<string, User[]>;
}
