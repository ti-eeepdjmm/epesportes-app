// components/matches/LineupBoard.tsx

import React, { FC, useEffect, useRef, useState } from 'react';
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
import { SvgCssUri } from 'react-native-svg/css'; 

interface LineupEntry {
  id: number;
  team: { id: number; name: string; logo: string };
  player: { id: number; position: string; jerseyNumber: number };
  starter: boolean;
}

interface PlayerDetail {
  id: number;
  name: string;
  avatar: string;
  position: string;
  jerseyNumber: number;
  starter: boolean;
}

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
  const hasLoaded = useRef(false);

  useEffect(() => {
     
    if (hasLoaded.current) return; // já carregado, evita nova requisição
    
    hasLoaded.current = true;
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
        if (isMounted) setLineups(result);
      } catch (err) {
        // console.error('Erro ao carregar lineup', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [matchId]);

  if (loading) {
    return <ActivityIndicator color={theme.greenLight} style={styles.loader} />;
  }

  const hasStarters = lineups.some(team => team.starters && team.starters.length > 0);
  if (!hasStarters) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ textAlign: 'center', fontSize: 16, color: theme.black }}>
        Nenhuma escalação registrada para esta partida.
      </Text>
    </View>
  );
}

  const { width } = Dimensions.get('window');
  const courtHeight = 500;
  const avatarSize = 48;

  type PlayerPosition = 'goleiro' | 'fixo' | 'alaEsquerda' | 'alaDireita' | 'pivo';

  const getPositionStyle = (pos: PlayerPosition, isSecondTeam: boolean) => {
    const centerX = width * 0.721 - avatarSize / 2;
    const quarterX = width * 0.45 - avatarSize / 2;
    const threeQuarterX = width * 1 - avatarSize / 2;

    const topPositions: Record<PlayerPosition, number> = {
      goleiro: courtHeight * 0.01,
      fixo: courtHeight * 0.20,
      alaEsquerda: courtHeight * 0.25,
      alaDireita: courtHeight * 0.25,
      pivo: courtHeight * 0.38,
    };

    const bottomPositions: Record<PlayerPosition, number> = {
      goleiro: courtHeight * 1.04,
      fixo: courtHeight * 0.86,
      alaEsquerda: courtHeight * 0.75,
      alaDireita: courtHeight * 0.75,
      pivo: courtHeight * 0.70,
    };

    const yPos = isSecondTeam
      ? bottomPositions[pos]
      : topPositions[pos];

    const xPos =
      pos === 'alaDireita' ? threeQuarterX :
        pos === 'alaEsquerda' ? quarterX :
          centerX;

    return { top: yPos, left: xPos };
  };

  const SVG_URL = 'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/logos/board-quadra-futsal.svg';
  const first = lineups[0];
  const second = lineups[1];

  return (
    <View>
      <View style={styles.courtContainer}>
        <SvgUri uri={SVG_URL} width="100%" height="100%" />

        
         {first && (
          <View style={[styles.teamLogo, styles.topLeftLogo]}>
            <SvgCssUri
              width={40}
              height={40}
              uri={first.teamLogo}
            />
          </View>
        )}
        {second && (
          <View style={[styles.teamLogo, styles.bottomRightLogo]}>
            <SvgCssUri
              width={40}
              height={40}
              uri={second.teamLogo}  
            />
          </View>
        )}
        
        {[...(first?.starters || []), ...(second?.starters || [])].map(p => {
          const isSecond = second?.starters.some(s => s.id === p.id);
          return (
            <View key={p.id} style={[styles.player, getPositionStyle(p.position as PlayerPosition, isSecond)]}>
              <Image source={{ uri: p.avatar }} style={[styles.avatar, { borderColor: isSecond ? theme.white : theme.yellow }]} />
              <Text style={styles.jersey}>{p.jerseyNumber}</Text>
              <Text style={styles.playerName}>{p.name}</Text>
            </View>
          );
        })} 


      </View>
      <View style={styles.reservesSection}>
        
        <View>
           <Text style={styles.reservesLabel}>Reservas</Text>
        </View>
        <View style={styles.reservesContainer} >
          <View style={styles.teamReserves}> 
            <Text style={styles.reservesTitle}>{first?.teamName}</Text>
            <View style={styles.reservesList}>
              {first?.reserves.map(p => (
                <View key={p.id} style={styles.reserveItem}>
                  <Image source={{ uri: p.avatar }} style={styles.reserveAvatar} />
                   <Text style={[styles.jersey, styles.jerseyReserve]}>{p.jerseyNumber}</Text>
                  <Text style={styles.reserveName}>{p.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.teamReserves}>
            <Text style={styles.reservesTitle}>{second?.teamName}</Text>
            <View style={styles.reservesList}>
              {second?.reserves.map(p => (
                <View key={p.id} style={styles.reserveItem}>
                  <Image source={{ uri: p.avatar }} style={styles.reserveAvatar} />
                  <Text style={[styles.jersey, styles.jerseyReserve]}>{p.jerseyNumber}</Text>
                  <Text style={styles.reserveName}>{p.name}</Text>
                </View>
              ))}
            </View>
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
      height: 600,
      position: 'relative',
      marginBottom: 32, // espaço para os reservas
    },
    player: { position: 'absolute', alignItems: 'center' },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      overflow: 'hidden',
    },
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
    jerseyReserve: {
      position: 'absolute',
      bottom: 20,
    },
    playerName: {
      position: 'absolute',
      top: 48 + 4,
      fontSize: 10,
      color: theme.white,
      width: 60,
      textAlign: 'center',
    },
    reservesSection: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingHorizontal: 32,
    },
    teamReserves: { flex: 1, padding: 8 },
    reservesTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 16,
      color: theme.black,
      textAlign: 'center',
    },
    reservesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reservesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },
    reserveItem: {
      width: '45%',
      alignItems: 'center',
      marginBottom: 8,
    },
    reserveAvatar: {
      width: 44,
      height: 44,
      borderRadius: 24,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: theme.grayLight,
    },
    reserveName: {
      fontSize: 12,
      textAlign: 'center',
      color: theme.black,
    },
    teamLogo: {
      position: 'absolute',
      borderWidth: 2,
      width: 48,
      height: 48,
      borderColor: theme.black,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topLeftLogo: {
      top: 100,
 
    },
    bottomRightLogo: {
      bottom: 100,
    },
    reservesLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 4,
      color: theme.greenLight,
    },
    divider: {
      width: 1.5,
      height: '90%',
      backgroundColor: theme.grayLight,
      marginHorizontal: 8,
    },
  });
