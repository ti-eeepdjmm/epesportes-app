import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppLoader } from '@/components/AppLoader';
import { MatchCardSummary } from '@/components/matches/MatchCardSummary';
import { TeamStandings } from '@/components/standings/TeamStandings';
import { TopScorers } from '@/components/rankings/TopScorers';
import api from '@/utils/api';
import { MatchSummary } from '@/types';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';
import { PlayerRankingItem, PlayerResolved } from '@/types/player';


export default function GamesScreen() {
  const theme = useTheme();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('left');
  const [refreshing, setRefreshing] = useState(false);
  const [scorers, setScorers] = useState<PlayerResolved[]>([]);


  const translateX = useRef(new Animated.Value(0)).current;

  const animateSlide = (direction: 'left' | 'right') => {
    translateX.setValue(direction === 'left' ? 300 : -300);

    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const loadMatches = async () => {
    try {
      const res = await api.get<MatchSummary[]>('/matches');
      setMatches(res.data.reverse()); // mantém a ordem antiga
    } catch (e) {
      console.error('Erro ao atualizar partidas:', e);
    } finally {
      setRefreshing(false);
    }
  } 

  const loadScorers = async () => {
    try {
      const { data } = await api.get<PlayerRankingItem[]>('/rankings/goals');
      const topPlayers = data.slice(0, 3); // Pode ajustar para mostrar mais

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

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadMatches(),
      loadScorers(),
    ]);
    setRefreshing(false);
  };


  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<MatchSummary[]>('/matches');
        setMatches(res.data.reverse()); // Mostra a última partida primeiro
      } catch (e) {
        console.error('Erro ao buscar partidas:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    animateSlide(animationDirection);
  }, [currentRound, currentMatchIndex]);

  if (loading) {
    return (
      <View style={styles(theme).loader}>
        <AppLoader visible />
      </View>
    );
  }

  const groupedMatches = matches.reduce((acc: MatchSummary[][], match, index) => {
    const groupIndex = Math.floor(index / 5);
    if (!acc[groupIndex]) acc[groupIndex] = [];
    acc[groupIndex].push(match);
    return acc;
  }, []);

  const currentRoundMatches = groupedMatches[currentRound] || [];
  const currentMatch = currentRoundMatches[currentMatchIndex];

  const handlePrev = () => {
    if (currentMatchIndex > 0) {
      setAnimationDirection('right');
      setCurrentMatchIndex(currentMatchIndex - 1);
    } else if (currentRound > 0) {
      const prevRound = currentRound - 1;
      setAnimationDirection('right');
      setCurrentRound(prevRound);
      setCurrentMatchIndex(groupedMatches[prevRound].length - 1);
    }
  };

  const handleNext = () => {
    if (currentMatchIndex < currentRoundMatches.length - 1) {
      setAnimationDirection('left');
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else if (currentRound < groupedMatches.length - 1) {
      const nextRound = currentRound + 1;
      setAnimationDirection('left');
      setCurrentRound(nextRound);
      setCurrentMatchIndex(0);
    }
  };

  return (
    <ScrollView
      style={styles(theme).container}
      contentContainerStyle={styles(theme).contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.greenLight]} // Android
          tintColor={theme.greenLight} // iOS
        />
      }
    >
      <Text style={styles(theme).sectionTitle}>Partidas</Text>

      <View style={styles(theme).roundContainer}>
        <View style={styles(theme).roundNavigation}>
          <TouchableOpacity
            onPress={() => {
              if (currentRound > 0) {
                setAnimationDirection('right');
                setCurrentRound(currentRound - 1);
                setCurrentMatchIndex(0);
              }
            }}
            disabled={currentRound === 0}
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={28}
              color={currentRound === 0 ? theme.gray : theme.greenLight}
            />
          </TouchableOpacity>

          <Text style={styles(theme).roundLabel}>Rodada {currentRound + 1}</Text>

          <TouchableOpacity
            onPress={() => {
              if (currentRound < groupedMatches.length - 1) {
                setAnimationDirection('left');
                setCurrentRound(currentRound + 1);
                setCurrentMatchIndex(0);
              }
            }}
            disabled={currentRound === groupedMatches.length - 1}
          >
            <Ionicons
              name="arrow-forward-circle-outline"
              size={28}
              color={
                currentRound === groupedMatches.length - 1
                  ? theme.gray
                  : theme.greenLight
              }
            />
          </TouchableOpacity>
        </View>

        {currentMatch && (
          <View>
            <Animated.View style={{ transform: [{ translateX }] }}>
              <MatchCardSummary
                key={currentMatch.id}
                match={currentMatch}
                onPress={() => router.push(`/matches/${currentMatch.id}`)}
              />
            </Animated.View>

            <View style={styles(theme).navigationButtons}>
              <TouchableOpacity
                onPress={handlePrev}
                disabled={currentRound === 0 && currentMatchIndex === 0}
              >
                <Ionicons
                  name="chevron-back-circle"
                  size={32}
                  color={
                    currentRound === 0 && currentMatchIndex === 0
                      ? theme.gray
                      : theme.greenLight
                  }
                />
              </TouchableOpacity>

              <Text style={styles(theme).matchNumber}>
                Partida {currentMatchIndex + 1} de {currentRoundMatches.length}
              </Text>

              <TouchableOpacity
                onPress={handleNext}
                disabled={
                  currentRound === groupedMatches.length - 1 &&
                  currentMatchIndex === currentRoundMatches.length - 1
                }
              >
                <Ionicons
                  name="chevron-forward-circle"
                  size={32}
                  color={
                    currentRound === groupedMatches.length - 1 &&
                      currentMatchIndex === currentRoundMatches.length - 1
                      ? theme.gray
                      : theme.greenLight
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

        )}
      </View>

      <Text style={styles(theme).sectionTitle}>Classificação</Text>
      <TeamStandings full={true} />

      <Text style={styles(theme).sectionTitle}>Artilharia</Text>
      <TopScorers full={true} data={scorers} />
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
    roundNavigation: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    roundLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.greenLight,
    },
    navigationButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingHorizontal: 16,
    },
    matchNumber: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.black,
    },
  });
