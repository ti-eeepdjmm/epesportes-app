import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppLoader } from '@/components/AppLoader';
import { MatchCardSummary } from '@/components/matches/MatchCardSummary';
import { TeamStandings } from '@/components/standings/TeamStandings'; // suposição
import { TopScorers } from '@/components/rankings/TopScorers'; // suposição
import api from '@/utils/api';
import { MatchSummary } from '@/types';
import { router } from 'expo-router';

export default function GamesScreen() {
  const theme = useTheme();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<MatchSummary[]>('/matches');
        setMatches(res.data);
      } catch (e) {
        console.error('Erro ao buscar partidas:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles(theme).loader}>
        <AppLoader visible />
      </View>
    );
  }

  // Agrupar por rodada (5 partidas por rodada)
  const groupedMatches = matches.reduce((acc: MatchSummary[][], match, index) => {
    const groupIndex = Math.floor(index / 5);
    if (!acc[groupIndex]) acc[groupIndex] = [];
    acc[groupIndex].push(match);
    return acc;
  }, []);

  return (
    <ScrollView
      style={styles(theme).container}
      contentContainerStyle={styles(theme).contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles(theme).sectionTitle}>Rodadas</Text>

      {groupedMatches.map((round, i) => (
        <View key={i} style={styles(theme).roundContainer}>
          <Text style={styles(theme).roundTitle}>Rodada {i + 1}</Text>
          {round.map((match) => (
            <MatchCardSummary
              key={match.id}
              match={match}
              onPress={() => router.push(`/matches/${match.id}`)}
            />
          ))}
        </View>
      ))}

      <Text style={styles(theme).sectionTitle}>Classificação</Text>
      <TeamStandings full={true} />

      <Text style={styles(theme).sectionTitle}>Artilharia</Text>
      <TopScorers full={true} />
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
      padding: 16,
    },
    loader: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.white,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.black,
      marginBottom: 8,
    },
    roundContainer: {
      marginBottom: 24,
    },
    roundTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.greenLight,
      marginBottom: 8,
    },
  });
