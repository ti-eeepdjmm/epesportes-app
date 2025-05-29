// hooks/usePolls.ts
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Alert } from 'react-native';

interface PollOption {
  option: string;
  userVotes: number[];
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  expiration: string;
}

export const usePolls = (userId: number | null) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await api.get<Poll[]>('/polls');
      setPolls(response.data);
    } catch (error) {
      Alert.alert('Erro ao carregar enquetes');
    } finally {
      setLoading(false);
    }
  };

  const voteOnPoll = async (pollId: string, option: string) => {
    try {
      await api.post(`/polls/${pollId}/vote`, {
        userId,
        option,
      });
      await fetchPolls(); // Atualiza enquetes após voto
    } catch (error: any) {
      Alert.alert(
        'Erro ao votar',
        error.response?.data?.message || 'Tente novamente mais tarde.'
      );
    }
  };

  useEffect(() => {
  if (!userId) return;
  fetchPolls();
}, [userId]);

  return {
    polls,
    loading,
    voteOnPoll,
  };
};
