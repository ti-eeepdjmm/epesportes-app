// components/MatchCardSummary.tsx
import React, { FC } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { formatTimestamp } from '@/utils/date';
import { useTheme } from '@/hooks/useTheme';
import { Team } from './Team';
import { MatchSummary } from '@/types';

interface Props {
  match: MatchSummary;
  onPress?: () => void;
}

export const MatchCardSummary: FC<Props> = ({ match, onPress }) => {
  const theme = useTheme();

  // Traduz status simples para rótulo
  const statusLabel =
    match.status === 'completed'
      ? 'Encerrado'
      : match.status === 'scheduled'
      ? 'Agendada'
      : match.status;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.white, borderColor: theme.grayLight }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.row}>
        <Team team={match.team1} score={match.score_team1} />
        <View style={styles.middle}>
          <Text style={[styles.gameName, { color: theme.black }]}>  
            {match.game.name}
          </Text>
          <Text style={[styles.date, { color: theme.gray }]}>  
            {formatTimestamp(match.dateTime, {
              includeTime: true,
              hideSeconds: true,
            })}
          </Text>
          <Text style={[styles.status, { color: theme.black }]}>  
            {statusLabel}
          </Text>
        </View>
        <Team team={match.team2} score={match.score_team2} reverse />
      </View>
      <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
        <Text style={[styles.detailsText, { color: theme.greenLight }]}>Detalhes</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    // iOS
     shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  gameName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
