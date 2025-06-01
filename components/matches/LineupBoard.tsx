// components/matches/LineupBoard.tsx

import React, { FC } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { LineupByTeam } from '@/types';
import { SvgCssUri } from 'react-native-svg/css';

interface Props {
  data: LineupByTeam[] | null;
}

export const LineupBoard: FC<Props> = ({ data }) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  if (!data || data.length === 0 || data.every(t => t.starters.length === 0)) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ textAlign: 'center', fontSize: 14, color: theme.black }}>
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

    const yPos = isSecondTeam ? bottomPositions[pos] : topPositions[pos];
    const xPos =
      pos === 'alaDireita' ? threeQuarterX :
      pos === 'alaEsquerda' ? quarterX :
      centerX;

    return { top: yPos, left: xPos };
  };

  const SVG_URL = 'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/logos/board-quadra-futsal.svg';
  const first = data[0];
  const second = data[1];

  return (
    <View>
      <View style={styles.courtContainer}>
        <SvgUri uri={SVG_URL} width="100%" height="100%" />

        {/* Logo do Time 1 (parte de cima da quadra) */}
        {first && (
          <View style={[styles.teamLogo, styles.logoTop]}>
            <SvgCssUri width={40} height={40} uri={first.teamLogo} />
          </View>
        )}

        {/* Logo do Time 2 (parte de baixo da quadra) */}
        {second && (
          <View style={[styles.teamLogo, styles.logoBottom]}>
            <SvgCssUri width={40} height={40} uri={second.teamLogo} />
          </View>
        )}

        {[...(first?.starters || []), ...(second?.starters || [])].map(p => {
          const isSecond = second?.starters.some(s => s.id === p.id);
          return (
            <View key={p.id} style={[styles.player, getPositionStyle(p.position as PlayerPosition, isSecond)]}>
              <Image
                source={{ uri: p.avatar }}
                style={[styles.avatar, { borderColor: isSecond ? theme.white : theme.yellow }]}
              />
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
        <View style={styles.reservesContainer}>
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
    courtContainer: {
      width: '100%',
      height: 600,
      position: 'relative',
      marginBottom: 32,
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
      top: 52,
      fontSize: 10,
      color: theme.white,
      width: 60,
      textAlign: 'center',
    },
    teamLogo: {
      position: 'absolute',
      width: 42,
      height: 42,
      zIndex: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.white,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: theme.gray,
    },
    logoTop: {
      top: 12,
      left: '50%',
      marginLeft: -42,
    },
    logoBottom: {
      bottom: 12,
      left: '50%',
      marginLeft: -42,
    },
    reservesSection: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingHorizontal: 32,
    },
    reservesLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 4,
      color: theme.greenLight,
    },
    reservesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    teamReserves: { flex: 1, padding: 8 },
    reservesTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 16,
      color: theme.black,
      textAlign: 'center',
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
    divider: {
      width: 1.5,
      height: '90%',
      backgroundColor: theme.grayLight,
      marginHorizontal: 8,
    },
  });
