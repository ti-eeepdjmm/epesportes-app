// app/home.tsx

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppLoader } from '@/components/AppLoader';
import { HomeHeader } from '@/components/HomeHeader';
import { StyledText } from '@/components/StyledText';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useSmartBackHandler } from '@/hooks/useSmartBackHandler';
import { useTheme } from '@/hooks/useTheme';
import { MatchSummary, User, UserPreferences } from '@/types';
import api from '@/utils/api';
import { MatchCardSummary } from '@/components/matches/MatchCardSummary';
import { PollCard } from '@/components/polls/PollCard';

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
  avatarsByOption: Record<string, User[]>;
}

export default function Home() {
  const theme = useTheme();
  const { user } = useAuth();
  const { setTheme } = useThemeContext();
  const router = useRouter();
  useSmartBackHandler();

  const [prefLoading, setPrefLoading] = useState(false);
  const [pollLoading, setPollLoading] = useState(true);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [lastMatch, setLastMatch] = useState<MatchSummary | null>(null);
  const [nextMatch, setNextMatch] = useState<MatchSummary | null>(null);

  useEffect(() => {
    async function loadPreferences() {
      try {
        setPrefLoading(true);
        const res = await api.get<UserPreferences>(`/user-preferences/user/${user?.id}`);
        setTheme(res.data.darkMode ? 'dark' : 'light');
      } catch { } finally {
        setPrefLoading(false);
      }
    }
    if (user?.id) loadPreferences();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get<MatchSummary[]>('/matches');
        const finished = res.data
          .filter(m => m.status === 'completed')
          .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        setLastMatch(finished[0] || null);

        const scheduled = res.data
          .filter(m => m.status === 'scheduled')
          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        setNextMatch(scheduled[0] || null);
      } catch (e) {
        console.warn('Erro ao buscar partidas', e);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setPollLoading(true);
        const pollRes = await api.get<Omit<Poll, 'avatarsByOption'>[]>('/polls');
        const pollsWithUsers: Poll[] = [];
        for (const poll of pollRes.data) {
          const avatarsByOption: Record<string, User[]> = {};
          for (const opt of poll.options) {
            const users = await Promise.all(
              opt.userVotes.map((id) => api.get(`/users/${id}`).then(res => res.data))
            );
            avatarsByOption[opt.option] = users;
          }
          pollsWithUsers.push({ ...poll, avatarsByOption });
        }
        setPolls(pollsWithUsers);
      } catch (err) {
        console.warn('Erro ao buscar enquetes', err);
      } finally {
        setPollLoading(false);
      }
    })();
  }, [user]);

  if (!user || prefLoading || pollLoading) {
    return (
      <View style={styles(theme).fullScreenLoader}>
        <AppLoader visible />
      </View>
    );
  }

  return (
      <ScrollView
        style={styles(theme).container}
        contentContainerStyle={styles(theme).contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        <View style={styles(theme).sectionHeaderContainer}>
          <StyledText style={styles(theme).subtitle}>Destaques Campeonato</StyledText>
          <TouchableOpacity onPress={() => router.push('/games')}>
            <StyledText style={styles(theme).linkText}>Ver todos</StyledText>
          </TouchableOpacity>
        </View>

        {lastMatch && (
          <>
            <StyledText style={styles(theme).smallSectionTitle}>Último Jogo</StyledText>
            <MatchCardSummary
              match={lastMatch}
              onPress={() => router.push(`/matches/${lastMatch.id}`)}
            />
          </>
        )}

        {nextMatch && (
          <>
            <StyledText style={styles(theme).smallSectionTitle}>Próximo Jogo</StyledText>
            <MatchCardSummary
              match={nextMatch}
              onPress={() => router.push(`/matches/${nextMatch.id}`)}
            />
          </>
        )}

        {polls.length > 0 && (
          <StyledText style={styles(theme).smallSectionTitle}>Enquetes</StyledText>
        )}

        {polls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            currentUserId={user.id}
            onVote={async (option) => {
              // Atualização otimista
              setPolls(prevPolls =>
                prevPolls.map(p => {
                  if (p.id !== poll.id) return p;

                  const updatedOptions = p.options.map(opt => {
                    let userVotes = [...opt.userVotes];
                    if (opt.option === option) {
                      if (!userVotes.includes(user.id)) userVotes.push(user.id);
                    } else {
                      userVotes = userVotes.filter(id => id !== user.id); // Remove voto anterior
                    }
                    return { ...opt, userVotes };
                  });

                  const avatarsByOption = { ...p.avatarsByOption };
                  Object.keys(avatarsByOption).forEach(key => {
                    avatarsByOption[key] = avatarsByOption[key].filter(u => u.id !== user.id);
                    if (key === option) avatarsByOption[key].push(user);
                  });

                  const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.userVotes.length, 0);

                  return {
                    ...p,
                    options: updatedOptions,
                    avatarsByOption,
                    totalVotes,
                  };
                })
              );

              // Requisição real
              try {
                await api.post(`/polls/${poll.id}/vote`, {
                  userId: user.id,
                  option,
                });
              } catch (error) {
                console.warn('Erro ao votar. Pode implementar rollback aqui se desejar.');
                // opcional: revert state or show alert
              }
            }}
          />
        ))}
      </ScrollView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.white,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      gap: 4,
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Poppins_600SemiBold',
      color: theme.black,
    },
    sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.greenLight,
    },
    linkText: {
      fontSize: 14,
      color: theme.greenLight,
    },
    smallSectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.black,
      marginTop: 8,
    },
    fullScreenLoader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
  });
