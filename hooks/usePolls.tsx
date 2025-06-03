import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Alert } from 'react-native';
import { Team, User } from '@/types';

interface EnrichedPollOption {
  type: 'text' | 'user' | 'team';
  value: string;
  label: string;
  image?: string;
  userVotes: number[];
}

interface Poll {
  id: string;
  question: string;
  options: EnrichedPollOption[];
  totalVotes: number;
  expiration: string;
  avatarsByOption: Record<string, User[]>;
}

export const usePolls = (userId: number | null) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);

  const enrichOptions = async (options: EnrichedPollOption[]): Promise<EnrichedPollOption[]> => {
    const enriched = await Promise.all(
      options.map(async (opt) => {
        let label = opt.value;
        let image;

        if (opt.type === 'user') {
          try {
            const { data } = await api.get(`/users/${opt.value}`);
            label = data.name;
            image = data.profilePhoto;
          } catch {
            label = `Usuário #${opt.value}`;
          }
        }

        if (opt.type === 'team') {
          try {
            const { data } = await api.get<Team>(`/teams/${opt.value}`);
            label = data.name;
            image = data.logo;
          } catch {
            label = `Time #${opt.value}`;
          }
        }

        return {
          ...opt,
          label,
          image,
          
        };
      })
    );

    return enriched;
  };

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await api.get<Poll[]>('/polls');

      const enrichedPolls = await Promise.all(
        response.data.map(async (poll) => {
          const enrichedOptions = await enrichOptions(poll.options);
          const avatarsByOption: Record<string, User[]> = {};

          // Agrupa usuários por opção
          for (const opt of enrichedOptions) {
            const voters = await Promise.all(
              opt.userVotes.map(async (userId: number) => {
                const { data } = await api.get<User>(`/users/${userId}`);
                return data;
              })
            );
            avatarsByOption[opt.value] = voters;
          }

          return {
            ...poll,
            options: enrichedOptions,
            avatarsByOption,
          };
        })
      );

      setPolls(enrichedPolls);
    } catch (error) {
      Alert.alert('Erro ao carregar enquetes');
    } finally {
      setLoading(false);
    }
  };

  // Dentro do hook usePolls
const voteOnPoll = async (pollId: string, optionValue: string, currentUser: User) => {
  // Atualização otimista
  setPolls(prevPolls =>
    prevPolls.map(poll => {
      if (poll.id !== pollId) return poll;

      const updatedOptions = poll.options.map(opt => {
        let newVotes = [...opt.userVotes];
        if (opt.value === optionValue) {
          if (!newVotes.includes(currentUser.id)) newVotes.push(currentUser.id);
        } else {
          newVotes = newVotes.filter(id => id !== currentUser.id);
        }
        return { ...opt, userVotes: newVotes };
      });

      const avatarsByOption = { ...poll.avatarsByOption };
      Object.keys(avatarsByOption).forEach(key => {
        avatarsByOption[key] = avatarsByOption[key].filter(u => u.id !== currentUser.id);
        if (key === optionValue) avatarsByOption[key].push(currentUser);
      });

      const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.userVotes.length, 0);

      return {
        ...poll,
        options: updatedOptions,
        avatarsByOption,
        totalVotes,
      };
    })
  );

  // Requisição real
  try {
    await api.post(`/polls/${pollId}/vote`, {
      userId: currentUser.id,
      optionValue,
    });
  } catch (error) {
    // Aqui você pode opcionalmente fazer rollback ou mostrar alerta
    console.warn('Erro ao votar. Pode implementar rollback se desejar.');
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
    refetch: fetchPolls
  };
};
