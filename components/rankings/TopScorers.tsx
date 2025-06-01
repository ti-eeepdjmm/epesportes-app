import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import api from '@/utils/api';
import { router } from 'expo-router';
import { SvgCssUri } from 'react-native-svg/css';
import { PlayerRankingItem, PlayerResolved } from '@/types/player';


interface Props {
  full?: boolean;
}

export const TopScorers: React.FC<Props> = ({
  full = false,
}) => {
  const theme = useTheme();
  const [players, setPlayers] = useState<PlayerResolved[]>([]);

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      const { data } = await api.get<PlayerRankingItem[]>('/rankings/goals');
      const topPlayers = full? data : data.slice(0, 3);

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

      setPlayers(resolvedPlayers);
    } catch (error) {
      console.error('Erro ao buscar artilharia:', error);
    }
  };

  return (
    <View style={[styles.container, styles.boxShadow, { backgroundColor: theme.white, borderColor: theme.grayLight }]}>
      <Text style={[styles.title, { color: theme.black }]}>Artilharia</Text>

      <View style={[styles.header, {borderColor: theme.grayDetail}]}>
        <Text style={[styles.headerLeft, { color: theme.black }]}>Jogador</Text>
        <Text style={[styles.headerRight, { color: theme.black }]}>Gols</Text>
      </View>

      {players.map((player, index) => (
        <View key={player.id} style={[styles.row, { borderBottomColor: theme.grayLight }]}>
          <View style={styles.playerInfo}>
            <Text style={[styles.position, { color: theme.black }]}>{index + 1}º</Text>
            <Image source={{ uri: player.photo }} style={styles.avatar} />
            <View style={styles.nameTeamContainer}>
              <Text style={[styles.name, { color: theme.black }]}>{player.name}</Text>
              <View style={styles.teamInfo}>
                <SvgCssUri uri={player.team.logo} width={20} height={20} />
                <Text style={[styles.teamName, { color: theme.gray }]}>
                  {player.team.name}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.goals, { color: theme.black }]}>{player.goals}</Text>
        </View>
      ))}

     {!full && (
      <TouchableOpacity onPress={() => router.push('/(tabs)/games')}>
        <Text style={[styles.buttonText, { color: theme.greenLight }]}>Ver lista completa</Text>
        <Text style={[styles.arrowDown, { color: theme.greenLight }]}>▼</Text>
      </TouchableOpacity>
     )
     }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 12,
    padding: 12,
  },
  boxShadow: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 2,
    marginTop: 8,
  },
  headerLeft: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  position: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  nameTeamContainer: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  goals: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
  arrowDown: {
    fontSize: 20,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: -2,
  },
});
