import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppLoader } from '@/components/AppLoader';
import { HomeHeader } from '@/components/HomeHeader';
import { StyledText } from '@/components/StyledText';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useTheme } from '@/hooks/useTheme';
import { MatchSummary } from '@/types';
import api from '@/utils/api';
import { MatchCardSummary } from '@/components/matches/MatchCardSummary';
import { PollCard } from '@/components/polls/PollCard';
import { usePolls } from '@/hooks/usePolls';
import { TeamStandings } from '@/components/standings/TeamStandings';
import { TopScorers } from '@/components/rankings/TopScorers';
import { PlayerRankingItem, PlayerResolved } from '@/types/player';
import { TeamStanding } from '@/types';

export default function Home() {
  const theme = useTheme();
  const { user } = useAuth();
  const { setTheme } = useThemeContext();
  const router = useRouter();

  const [prefLoading, setPrefLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchSummary | null>(null);
  const [nextMatch, setNextMatch] = useState<MatchSummary | null>(null);
  const [scorers, setScorers] = useState<PlayerResolved[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const { polls, loading: pollLoading, voteOnPoll, refetch: refetchPolls } = usePolls(user?.id || null);

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

  const loadMatches = async () => {
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
  };

  const loadScorers = async () => {
    try {
      const { data } = await api.get<PlayerRankingItem[]>('/rankings/goals');
      const topPlayers = data.slice(0, 3);

      const resolvedPlayers = await Promise.all(
        topPlayers.map(async (item) => {
          const res = await api.get(`/players/${item.player.id}`);
          const player = res.data;

          return {
            id: player.id,
            name: player.user.name,
            photo: player.user.profilePhoto || `https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png`,
            team: {
              name: player.team.name,
              logo: player.team.logo,
            },
            goals: item.goals,
          };
        })
      );

      setScorers(resolvedPlayers);
    } catch (error) {
      console.error('Erro ao buscar artilharia:', error);
    }
  };

  const loadStandings = async () => {
    try {
      const { data } = await api.get<TeamStanding[]>('/team-standings/ordered');
      setStandings(data);
    } catch (error) {
      console.error('Erro ao buscar classificação:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadMatches(),
      loadScorers(),
      loadStandings(),
      refetchPolls?.(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
  if (user?.id) {
    Promise.all([
      // loadPreferences(),
      loadMatches(),
      loadScorers(),
      loadStandings(),
      refetchPolls?.(),
    ]).finally(() => setInitialLoading(false));
  }
}, [user]);

  if (!user || initialLoading) {
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.greenLight]}
          tintColor={theme.greenLight}
        />
      }
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
      <TeamStandings data={standings} />

      <StyledText style={styles(theme).smallSectionTitle}>Artilharia</StyledText>
      <TopScorers data={scorers} />

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
