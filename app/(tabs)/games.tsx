import React, { useEffect, useMemo, useRef } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  RefreshControl,
  PanResponder,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppLoader } from '@/components/AppLoader';
import { MatchCardSummary } from '@/components/matches/MatchCardSummary';
import { TeamStandings } from '@/components/standings/TeamStandings';
import { TopScorers } from '@/components/rankings/TopScorers';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGamesStore } from '@/stores/useGamesStore';
import { HomeHeader } from '@/components/HomeHeader';

export default function GamesScreen() {
  const theme = useTheme();
  const {
    matches,
    scorers,
    standings,
    initialLoading,
    refreshing,
    currentRound,
    currentMatchIndex,
    loadAll,
    onRefresh,
    handlePrev,
    handleNext,
    setRoundIndex,
  } = useGamesStore();

  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAll();
  }, []);

  const groupedMatches = matches.reduce((acc: any[][], match, index) => {
    const groupIndex = Math.floor(index / 5);
    if (!acc[groupIndex]) acc[groupIndex] = [];
    acc[groupIndex].push(match);
    return acc;
  }, []);

  const currentRoundMatches = groupedMatches[currentRound] || [];
  const currentMatch = currentRoundMatches[currentMatchIndex];

  const isFirstMatch = currentRound === 0 && currentMatchIndex === 0;
  const isLastMatch =
    currentRound === groupedMatches.length - 1 &&
    currentMatchIndex === currentRoundMatches.length - 1;

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = 80;

        if (gestureState.dx < -threshold && !isLastMatch) {
          Animated.timing(translateX, {
            toValue: -300,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            handleNext();
            translateX.setValue(300);
            Animated.timing(translateX, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start();
          });
        } else if (gestureState.dx > threshold && !isFirstMatch) {
          Animated.timing(translateX, {
            toValue: 300,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            handlePrev();
            translateX.setValue(-300);
            Animated.timing(translateX, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  }, [currentMatchIndex, currentRound, isFirstMatch, isLastMatch]);

  if (initialLoading) {
    return (
      <View style={styles(theme).loader}>
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
      <Text style={styles(theme).sectionTitle}>Partidas</Text>

      <View style={styles(theme).roundContainer}>
        <View style={styles(theme).roundNavigation}>
          <TouchableOpacity
            onPress={() => setRoundIndex(currentRound - 1)}
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
            onPress={() => setRoundIndex(currentRound + 1)}
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
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                transform: [{ translateX }],
              }}
            >
              <MatchCardSummary
                key={currentMatch.id}
                match={currentMatch}
                onPress={() => router.push(`/matches/${currentMatch.id}`)}
              />
            </Animated.View>

            <View style={styles(theme).navigationButtons}>
              <TouchableOpacity
                onPress={() => {
                  if (isFirstMatch) return;
                  Animated.timing(translateX, {
                    toValue: 300,
                    duration: 150,
                    useNativeDriver: true,
                  }).start(() => {
                    handlePrev();
                    translateX.setValue(-300);
                    Animated.timing(translateX, {
                      toValue: 0,
                      duration: 150,
                      useNativeDriver: true,
                    }).start();
                  });
                }}
                disabled={isFirstMatch}
              >
                <Ionicons
                  name="chevron-back-circle"
                  size={32}
                  color={isFirstMatch ? theme.gray : theme.greenLight}
                />
              </TouchableOpacity>

              <Text style={styles(theme).matchNumber}>
                Partida {currentMatchIndex + 1} de {currentRoundMatches.length}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  if (isLastMatch) return;
                  Animated.timing(translateX, {
                    toValue: -300,
                    duration: 150,
                    useNativeDriver: true,
                  }).start(() => {
                    handleNext();
                    translateX.setValue(300);
                    Animated.timing(translateX, {
                      toValue: 0,
                      duration: 150,
                      useNativeDriver: true,
                    }).start();
                  });
                }}
                disabled={isLastMatch}
              >
                <Ionicons
                  name="chevron-forward-circle"
                  size={32}
                  color={isLastMatch ? theme.gray : theme.greenLight}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Text style={styles(theme).sectionTitle}>Classificação</Text>
      <TeamStandings data={standings} full={true} />

      <Text style={styles(theme).sectionTitle}>Artilharia</Text>
      <TopScorers full={true} data={scorers} />
    </ScrollView>
  );
}

const styles = (theme: any) => StyleSheet.create({
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
