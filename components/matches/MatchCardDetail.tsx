// components/matches/MatchCardDetail.tsx

import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { LineupEntry, MatchSummary, PlayerDetail, User } from '@/types';
import { formatTimestamp } from '@/utils/date';
import { Team } from './Team';
import api from '@/utils/api';
import { LineupBoard } from './LineupBoard';
import { LineupByTeam } from '@/types'; // Certifique-se de que o caminho está correto


interface Props {
  match: MatchSummary;
}

interface Stat {
  id: number;
  match: { id: number };
  team: { id: number; name: string; logo: string };
  goals: number;
  playersGoals: Record<string, number> | null;
  fouls: number;
  shots: number;
  penalties: number;
  possession: number;
  corners?: number;
  yellowCards?: number;
  redCards?: number;
}

export const MatchCardDetail: FC<Props> = ({ match }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'statistics' | 'lineup'>('statistics');
  const [stats, setStats] = useState<{ left: Stat; right: Stat } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [lineupData, setLineupData] = useState<LineupByTeam[] | null>(null);
  const [loadingLineup, setLoadingLineup] = useState(true);


  const statusLabel =
    match.status === 'completed'
      ? 'Encerrado'
      : match.status === 'scheduled'
        ? 'Agendada'
        : match.status;

  // Carrega as estatísticas do jogo
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await api.get<Stat[]>(`/match-stats/match/${match.id}`);
        const left = res.data.find(s => s.team.id === match.team1.id)!;
        const right = res.data.find(s => s.team.id === match.team2.id)!;
        if (isMounted) setStats({ left, right });
      } catch (err) {
        console.error('Erro ao carregar estatísticas', err);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    })();
    return () => { isMounted = false; };
  }, [match.id]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { data: entries } = await api.get<LineupEntry[]>(`/lineups/match/${match.id}`);
        const grouped: Record<number, LineupEntry[]> = {};
        entries.forEach(e => {
          if (!grouped[e.team.id]) grouped[e.team.id] = [];
          grouped[e.team.id].push(e);
        });

        const result = await Promise.all(
          Object.values(grouped).map(async arr => {
            const { team } = arr[0];
            const details: PlayerDetail[] = await Promise.all(
              arr.map(async entry => {
                const res = await api.get<{ user: User }>(`/players/${entry.player.id}`);
                const userData = res.data.user;

                return {
                  id: userData.id,
                  name: userData.name,
                  avatar: userData.profilePhoto || 'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png',
                  position: entry.player.position,
                  jerseyNumber: entry.player.jerseyNumber,
                  starter: entry.starter,
                };
              })
            );
            return {
              teamId: team.id,
              teamName: team.name,
              teamLogo: team.logo,
              starters: details.filter(d => d.starter),
              reserves: details.filter(d => !d.starter),
            };
          })
        );

        if (isMounted) {
          setLineupData(result);
          setLoadingLineup(false);
        }
      } catch (err) {
        // console.error('Erro ao carregar lineup', err);
        setLoadingLineup(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [match.id]);



  return (
    <ScrollView contentContainerStyle={styles(theme).container}>
      {/* Header */}
      <View style={styles(theme).headerRow}>
        <Team team={match.team1} score={match.score_team1} />
        <View style={styles(theme).headerMiddle}>
          <Text style={[styles(theme).gameName, { color: theme.black }]}>
            {match.game.name}
          </Text>
          <Text style={[styles(theme).date, { color: theme.gray }]}>
            {formatTimestamp(match.dateTime, { includeTime: true, hideSeconds: true })}
          </Text>
          <Text style={[styles(theme).status, { color: theme.greenLight }]}>
            {statusLabel}
          </Text>
        </View>
        <Team team={match.team2} score={match.score_team2} reverse />
      </View>

      {/* Tabs */}
      <View style={styles(theme).tabContainer}>
        <TouchableOpacity
          style={[styles(theme).tab, activeTab === 'statistics' && { borderBottomColor: theme.greenLight }]}
          onPress={() => setActiveTab('statistics')}
        >
          <Text style={{ color: theme.black, fontWeight: activeTab === 'statistics' ? '600' : '400' }}>
            Estatísticas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles(theme).tab, activeTab === 'lineup' && { borderBottomColor: theme.greenLight }]}
          onPress={() => setActiveTab('lineup')}
        >
          <Text style={{ color: theme.black, fontWeight: activeTab === 'lineup' ? '600' : '400' }}>
            Escalação
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      {activeTab === 'statistics' && (
        loadingStats || !stats ? (
          <ActivityIndicator color={theme.greenLight} style={{ marginTop: 32 }} />
        ) : (
          <View style={styles(theme).statsContainer}>
            {/* Posse de bola */}
            <View style={styles(theme).possessionTitleRow}>
              <Text style={[styles(theme).sectionTitle, { flex: 1, textAlign: 'center' }]}>Posse de bola</Text>
            </View>
            <View style={styles(theme).possessionBarContainer}>
              <View style={[styles(theme).possessionBar, { flex: stats.left.possession }]}>
                <Text style={[styles(theme).possessionTextLeft]}>
                  {stats.left.possession}%
                </Text>
              </View>
              <View style={[styles(theme).possessionBarOpp, { flex: stats.right.possession }]}>
                <Text style={[styles(theme).possessionTextRight]}>
                  {stats.right.possession}%
                </Text>
              </View>
            </View>

            {/* Gols */}
            <View style={styles(theme).statRow}>
              <Text style={styles(theme).statValue}>{stats.left.goals}</Text>
              <Text style={styles(theme).statLabel}>Gols</Text>
              <Text style={styles(theme).statValue}>{stats.right.goals}</Text>
            </View>
            {/* Artilheiros */}
            <View style={[styles(theme).playersGoalsContainer, { marginBottom: stats.left.playersGoals ? 8 : 0 }]}>
              <View style={styles(theme).playersGoalsSide}>
                {stats.left.playersGoals &&
                  Object.entries(stats.left.playersGoals).map(([name, count]) => (
                    <Text key={name} style={[styles(theme).playerGoalText, { color: theme.gray }]}>
                      {name} ({count})
                    </Text>
                  ))}
              </View>
              <View style={styles(theme).playersGoalsSide}>
                {stats.right.playersGoals &&
                  Object.entries(stats.right.playersGoals).map(([name, count]) => (
                    <Text key={name} style={[styles(theme).playerGoalText, { color: theme.gray }]}>
                      ({count}) {name}
                    </Text>
                  ))}
              </View>
            </View>
            <View>
              <View style={[styles(theme).statDivider]} />
            </View>
            {/* Outras estatísticas */}
            {([
              ['Finalizações', stats.left.shots, stats.right.shots],
              ['Pênaltis', stats.left.penalties, stats.right.penalties],
              ['Escanteios', stats.left.corners ?? 0, stats.right.corners ?? 0],
              ['Faltas', stats.left.fouls, stats.right.fouls],
              ['Cartões amarelos', stats.left.yellowCards ?? 0, stats.right.yellowCards ?? 0],
              ['Cartões vermelhos', stats.left.redCards ?? 0, stats.right.redCards ?? 0],
            ] as [string, number, number][]).map(([label, l, r], idx) => (
              <View key={idx} style={styles(theme).statRow}>
                <Text style={styles(theme).statValue}>{l}</Text>
                <Text style={styles(theme).statLabel}>{label}</Text>
                <Text style={styles(theme).statValue}>{r}</Text>
                <View style={styles(theme).statDivider} />
              </View>
            ))}
          </View>
        )
      )}

      {activeTab === 'lineup' && (
        <View style={styles(theme).lineupContainer}>
          {loadingLineup ? (
            <ActivityIndicator color={theme.greenLight} />
          ) : (
            <LineupBoard data={lineupData} />
          )}
        </View>
      )}

    </ScrollView>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: { padding: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    headerMiddle: { flex: 1, alignItems: 'center' },
    gameName: { fontSize: 16, fontWeight: '600' },
    date: { fontSize: 12, marginVertical: 4 },
    status: { fontSize: 12 },
    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.grayLight, marginBottom: 16 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    statsContainer: {},
    sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: theme.black },
    possessionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    possessionBarContainer: { flexDirection: 'row', height: 20, borderRadius: 10, overflow: 'hidden', marginBottom: 16 },
    possessionBar: { backgroundColor: theme.grayLight, justifyContent: 'center' },
    possessionBarOpp: { backgroundColor: theme.greenLight, justifyContent: 'center', alignItems: 'flex-end' },
    possessionTextLeft: { fontSize: 10, marginLeft: 4 },
    possessionTextRight: { fontSize: 10, color: theme.white, marginRight: 4 },
    statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, position: 'relative' },
    statLabel: { fontSize: 14, color: theme.black, flex: 2, textAlign: 'center' },
    statValue: { fontSize: 14, fontWeight: '600', color: theme.black, flex: 1, textAlign: 'center' },
    statDivider: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: theme.grayLight },
    playersSectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    playersGoalsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    playersGoalsSide: { flex: 1, alignItems: 'center' },
    playerGoalText: { fontSize: 12 },
    lineupContainer: { alignItems: 'center' },
    placeholderText: { fontSize: 14 },
  });
