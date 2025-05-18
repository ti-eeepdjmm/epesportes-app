// components/matches/LineupBoard.tsx

import React, { FC, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import api from '@/utils/api';
import { useTheme } from '@/hooks/useTheme';
import { User } from '@/types';

// Tipagem de cada entrada de lineup
interface LineupEntry {
  id: number;
  team: { id: number; name: string; logo: string };
  player: { id: number; position: string; jerseyNumber: number };
  starter: boolean;
}

// Detalhes enriquecidos do jogador
interface PlayerDetail {
  id: number;
  name: string;
  avatar: string;
  position: string;
  jerseyNumber: number;
  starter: boolean;
}

// Estrutura por time
interface LineupByTeam {
  teamId: number;
  teamName: string;
  teamLogo: string;
  starters: PlayerDetail[];
  reserves: PlayerDetail[];
}

interface Props {
  matchId: number;
}

export const LineupBoard: FC<Props> = ({ matchId }) => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [lineups, setLineups] = useState<LineupByTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: entries } = await api.get<LineupEntry[]>(`/lineups/match/${matchId}`);
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
                let userData: User;
                const res = await api.get<{ user: User }>(`/players/${entry.player.id}`);
                userData = res.data.user;
                
                return {
                  id: userData.id,
                  name: userData.name,
                  avatar: userData.profilePhoto || '',
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
        if (isMounted) setLineups(result);
      } catch (err) {
        console.error('Erro ao carregar lineup', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [matchId]);

  if (loading) {
    return <ActivityIndicator color={theme.greenLight} style={styles.loader} />;
  }

  const { width } = Dimensions.get('window');
  const courtHeight = 500;
  const avatarSize = 48;

  const getBase = (pos: string) => {
    const centerX = width * 0.5 - avatarSize / 2;
    switch (pos) {
      case 'goleiro':     return { top: courtHeight * 0.8, left: centerX };
      case 'fixo':        return { top: courtHeight * 0.6, left: centerX };
      case 'alaDireita':  return { top: courtHeight * 0.5, left: width * 0.75 - avatarSize / 2 };
      case 'alaEsquerda': return { top: courtHeight * 0.5, left: width * 0.25 - avatarSize / 2 };
      case 'pivo':        return { top: courtHeight * 0.4, left: centerX };
      default:            return { top: courtHeight * 0.6, left: centerX };
    }
  };

  // Espelha para segundo time
  const getPositionStyle = (pos: string, second: boolean) => {
    const base = getBase(pos);
    if (!second) return base;
    return { top: base.top, left: width - base.left - avatarSize };
  };

  const SVG_URL = 'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/logos/board-quadra-futsal.svg';
  const first = lineups[0];
  const second = lineups[1];

  return (
    <View>
      <View style={styles.courtContainer}>
        <SvgUri uri={SVG_URL} width="100%" height="100%" />
        {[...(first?.starters || []), ...(second?.starters || [])].map(p => {
          const isSecond = second?.starters.some(s => s.id === p.id);
          return (
            <View key={p.id} style={[styles.player, getPositionStyle(p.position, !!isSecond)]}>
              <Image source={{ uri: p.avatar }} style={styles.avatar} />
              <Text style={styles.jersey}>{p.jerseyNumber}</Text>
              <Text style={styles.playerName}>{p.name}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.reservesSection}>
        <View style={styles.teamReserves}>
          <Text style={styles.reservesTitle}>{first?.teamName}</Text>
          <View style={styles.reservesList}>
            {first?.reserves.map(p => (
              <View key={p.id} style={styles.reserveItem}>
                <Image source={{ uri: p.avatar }} style={styles.reserveAvatar} />
                <Text style={styles.reserveName}>{p.name}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.teamReserves}>
          <Text style={styles.reservesTitle}>{second?.teamName}</Text>
          <View style={styles.reservesList}>
            {second?.reserves.map(p => (
              <View key={p.id} style={styles.reserveItem}>
                <Image source={{ uri: p.avatar }} style={styles.reserveAvatar} />
                <Text style={styles.reserveName}>{p.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    loader: { margin: 16 },
    courtContainer: {
      width: '100%',
      height: 500,
      position: 'relative',
      marginBottom: 12,
    },
    player: { position: 'absolute', alignItems: 'center', },
    avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: theme.white, overflow: 'hidden' },
    jersey: { 
        position: 'absolute', 
        bottom: 0, 
        fontSize: 10, 
        fontWeight: '900', 
        color: theme.greenLight, 
        textAlign: 'center', 
        backgroundColor: theme.white, 
        borderRadius: 12,  
        padding: 2,
        width: 24,
        opacity: 0.8,

    },
    playerName: { position: 'absolute', top: 48 + 4, fontSize: 10, color: theme.white, width: 48, textAlign: 'center' },
    reservesSection: { flexDirection: 'row', justifyContent: 'space-between' },
    teamReserves: { flex: 1, padding: 8 },
    reservesTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: theme.black },
    reservesList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
    reserveItem: { width: '45%', alignItems: 'center', marginBottom: 8 },
    reserveAvatar: { width: 40, height: 40, borderRadius: 20, marginBottom: 4, borderWidth: 1, borderColor: theme.grayLight },
    reserveName: { fontSize: 12, textAlign: 'center', color: theme.black },
  });
