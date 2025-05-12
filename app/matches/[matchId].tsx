// app/matches/[matchId].tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/utils/api';
import { formatTimestamp } from '@/utils/date';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { AppLoader } from '@/components/AppLoader';

// Modela a resposta da API conforme o JSON fornecido
interface MatchDetail {
  id: number;
  game: {
    id: number;
    name: string;
    description: string;
    rules: string;
    created_at: string;
  };
  team1: {
    id: number;
    name: string;
    logo: string;
    createdAt: string;
  };
  team2: {
    id: number;
    name: string;
    logo: string;
    createdAt: string;
  };
  score_team1: number;
  score_team2: number;
  status: 'scheduled' | 'completed' | 'cancelled' | string;
  dateTime: string;
}

export default function MatchScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const theme = useTheme();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    (async () => {
      try {
        const res = await api.get<MatchDetail>(`/matches/${matchId}`);
        setMatch(res.data);
      } catch {
        setError('Erro ao carregar partida.');
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId]);

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

  // Traduz status para PT-BR
  const statusLabel =
    match.status === 'completed'
      ? 'Finalizada'
      : match.status === 'scheduled'
        ? 'Agendada'
        : match.status.charAt(0).toUpperCase() + match.status.slice(1);

  const handleBack = () => {
    router.back();
  };


  return (
    <ScrollView contentContainerStyle={styles(theme).container}>
      <View style={styles(theme).topBar}>
        <TouchableOpacity onPress={handleBack} style={styles(theme).backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.black} />
        </TouchableOpacity>
         <Text style={[styles(theme).title,  { color: theme.black }]}>Partida</Text>
      </View>
      <View style={styles(theme).teams}>
        <View style={styles(theme).team}>
          {match.team1.logo && (
            <Image source={{ uri: match.team1.logo }} style={styles(theme).logo} />
          )}
          <Text style={[styles(theme).teamName, { color: theme.black }]}>
            {match.team1.name}
          </Text>
          <Text style={[styles(theme).score, { color: theme.greenLight }]}>
            {match.score_team1}
          </Text>
        </View>
        <Text style={[styles(theme).vs, { color: theme.black }]}>x</Text>
        <View style={styles(theme).team}>
          {match.team2.logo && (
            <Image source={{ uri: match.team2.logo }} style={styles(theme).logo} />
          )}
          <Text style={[styles(theme).teamName, { color: theme.black }]}>
            {match.team2.name}
          </Text>
          <Text style={[styles(theme).score, { color: theme.greenLight }]}>
            {match.score_team2}
          </Text>
        </View>
      </View>

      <Text style={[styles(theme).subtitle, { color: theme.greenLight }]}>
        {statusLabel} - {formatTimestamp(match.dateTime, { includeTime: true, timeOptions: { hour: '2-digit', minute: '2-digit' } })}
      </Text>
    </ScrollView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      marginBottom: 16,
    },
    teams: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    team: {
      alignItems: 'center',
      flex: 1,
    },
    logo: {
      width: 48,
      height: 48,
      marginBottom: 4,
      borderRadius: 24,
    },
    teamName: {
      fontSize: 16,
      marginBottom: 2,
    },
    score: {
      fontSize: 18,
      fontWeight: '600',
    },
    vs: {
      fontSize: 18,
      fontWeight: '600',
      marginHorizontal: 8,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      marginBottom: 12,
    },
    subtitleText: {},
    error: {
      fontSize: 16,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    backButton: {
      marginRight: 12,
    },
  });
