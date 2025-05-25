// components/matches/Team.tsx
import React, { FC } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SvgCssUri } from 'react-native-svg/css';
import { useTheme } from '@/hooks/useTheme';
import { TeamInfo } from '@/types';


interface Props {
  team: TeamInfo;
  score?: number;
  reverse?: boolean;
}

export const Team: FC<Props> = ({ team, score, reverse }) => {
  const theme = useTheme();
  const isSvg = team.logo.toLowerCase().endsWith('.svg');

  return (
    <View style={[styles.container, {flexDirection: reverse? 'row-reverse' : 'row'}]}>
      <View>
        {isSvg ? (
          <View style={[styles.logo, { borderColor: theme.grayLight }]}>
            <SvgCssUri
              width={48}
              height={48}
              uri={team.logo}
            />
          </View>
        ) : (
          <View style={[styles.logo, { borderColor: theme.grayLight }]}>
            <Image
              source={{ uri: team.logo }}
            />
          </View>
        )}
        <Text style={[styles.name, { color: theme.black }]}>
          {team.name}
        </Text>
      </View>
      {typeof score === 'number' && (
        <View>
          <Text style={[styles.score, { color: theme.black }]}>
            {score}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    width: 60,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 28,
    marginBottom: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
  },
  score: {
    marginTop: 4,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
});
