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
import { MatchSummary } from '@/types';
import api from '@/utils/api';
import { MatchCardSummary } from '@/components/matches/MatchCardSummary';
import { PollCard } from '@/components/polls/PollCard';
import { usePolls } from '@/hooks/usePolls';
import { TeamStandingsPreview } from '@/components/standings/TeamStandingsPreview';
import { TopScorersPreview } from '@/components/rankings/TopScorerPreview';

export default function Home() {
  const theme = useTheme();
  const { user } = useAuth();
  const { setTheme } = useThemeContext();
  const router = useRouter();
  useSmartBackHandler();

  const [prefLoading, setPrefLoading] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchSummary | null>(null);
  const [nextMatch, setNextMatch] = useState<MatchSummary | null>(null);

  const { polls, loading: pollLoading, voteOnPoll } = usePolls(user?.id || null);

  useEffect(() => {
    async function loadPreferences() {
      try {
        setPrefLoading(true);
        const res = await api.get(`/user-preferences/user/${user?.id}`);
        setTheme(res.data.darkMode ? 'dark' : 'light');
      } catch {
      } finally {
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

      <StyledText style={styles(theme).smallSectionTitle}>Classificação</StyledText>
      <TeamStandingsPreview />
      <StyledText style={styles(theme).smallSectionTitle}>Artilharia</StyledText>
      <TopScorersPreview />

      {polls.length > 0 && (
        <StyledText style={styles(theme).smallSectionTitle}>Enquetes</StyledText>
      )}

      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          poll={poll}
          currentUserId={user.id}
          onVote={(option) => voteOnPoll(poll.id, option, user)}
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
