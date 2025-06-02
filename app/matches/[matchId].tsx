// app/matches/[matchId].tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '@/utils/api';
import { useTheme } from '@/hooks/useTheme';
import { AppLoader } from '@/components/AppLoader';
import { Ionicons } from '@expo/vector-icons';
import { MatchCardDetail } from '@/components/matches/MatchCardDetail';
import { MatchSummary } from '@/types';
import { useCustomBack } from '@/hooks/useCustomBack';

interface MatchDetailAPI {
  id: number;
  game: { id: number; name: string; description: string; rules: string; created_at: string };
  team1: { id: number; name: string; logo: string; createdAt: string };
  team2: { id: number; name: string; logo: string; createdAt: string };
  score_team1: number;
  score_team2: number;
  status: 'scheduled' | 'completed' | 'cancelled' | string;
  dateTime: string;
}

export default function MatchScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [match, setMatch] = useState<MatchDetailAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useCustomBack('/(tabs)/games');

  useEffect(() => {
    if (!matchId) return;
    (async () => {
      try {
        const res = await api.get<MatchDetailAPI>(`/matches/${matchId}`);
        setMatch(res.data);
      } catch {
        setError('Erro ao carregar partida.');
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId]);

 const handleBack = () => {router.back();};

  if (loading) {
    return (
      <View style={styles(theme).center}>
        <AppLoader visible />
      </View>
    );
  }

  if (error || !match) {
    return (
      <View style={styles(theme).center}>
        <Text style={[styles(theme).error, { color: theme.error }]}>
          {error || 'Partida não encontrada.'}
        </Text>
      </View>
    );
  }

  // Mapear para MatchSummary
  const summary: MatchSummary = {
    id: match.id,
    game: match.game,
    dateTime: match.dateTime,
    status: match.status,
    team1: match.team1,
    team2: match.team2,
    score_team1: match.score_team1,
    score_team2: match.score_team2,
  };

  return (
    <ScrollView contentContainerStyle={styles(theme).container}>
      <View style={styles(theme).topBar}>
        <TouchableOpacity onPress={handleBack} style={styles(theme).backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.black} />
        </TouchableOpacity>
        <Text style={[styles(theme).title, { color: theme.black }]}>Detalhes da Partida</Text>
      </View>

      <MatchCardDetail match={summary} />
    </ScrollView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.white,
      minHeight: '100%',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.white,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    backButton: {
      marginRight: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    error: {
      fontSize: 16,
    },
  });
