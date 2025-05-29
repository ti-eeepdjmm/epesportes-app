// components/polls/PollCard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useTheme } from '@/hooks/useTheme';
import { AvatarGroup } from './AvatarGroup';
import { User } from '@/types';
import { StyledText } from '../StyledText';

interface PollOption {
  option: string;
  userVotes: number[];
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  expiration: string;
  avatarsByOption: Record<string, User[]>;
}

interface PollCardProps {
  poll: Poll;
  currentUserId: number;
  onVote: (option: string) => void;
  shadowOn?: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, currentUserId, onVote, shadowOn=true }) => {
  const theme = useTheme();
  const [showVoters, setShowVoters] = useState<PollOption | null>(null);
  const [voterUsers, setVoterUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const hasVoted = poll.options.some((opt) => opt.userVotes.includes(currentUserId));
  const isVotingOpen = new Date(poll.expiration).getTime() > Date.now();

  const handleVote = (option: string) => {
    if (!hasVoted && isVotingOpen) {
      onVote(option);
    }
  };

  useEffect(() => {
    if (showVoters) {
      setLoadingUsers(true);
      setVoterUsers(poll.avatarsByOption[showVoters.option] || []);
      setLoadingUsers(false);
    }
  }, [showVoters, poll.avatarsByOption]);

  const winningOption = poll.options.reduce((prev, current) =>
    current.userVotes.length > prev.userVotes.length ? current : prev
  );

  return (
    <View
      style={[
        styles.container,
        shadowOn? styles.boxShadow : {},
        {
          backgroundColor: theme.white,
          shadowColor: theme.black,
          borderColor: theme.grayLight,
        },
      ]}
    >
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.black }}>{poll.question}</Text>

      {poll.options.map((opt, index) => {
        const percentage = poll.totalVotes ? opt.userVotes.length / poll.totalVotes : 0;
        const avatars = poll.avatarsByOption[opt.option] || [];
        const isWinner = opt.option === winningOption.option;
        const progressColor = isVotingOpen
          ? theme.greenLight
          : isWinner
            ? theme.greenLight
            : theme.gray;

        return (
          <View key={opt.option}>
            <TouchableOpacity
              onPress={() => handleVote(opt.option)}
              disabled={hasVoted || !isVotingOpen}
              style={{ marginVertical: 10 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.black }}>{opt.option}</Text>
                <Text>{(percentage * 100).toFixed(0)}%</Text>
              </View>
              <ProgressBar
                progress={percentage}
                color={progressColor}
                style={{ height: 24, borderRadius: 8, marginTop: 4 }}
              />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setShowVoters(opt)} style={{ width: '50%' }}>
                <AvatarGroup users={avatars} />
              </TouchableOpacity>
              {opt.userVotes.includes(currentUserId) && (
                <Text style={{
                  marginLeft: 8,
                  fontSize: 12,
                  color: theme.greenLight,
                }}>
                  ✔️ Seu voto!
                </Text>
              )}

            </View>
          </View>
        );
      })}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, marginTop: 8, fontWeight: 'bold' }}>Total de votos: {poll.totalVotes}</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View
            style={[
              styles.circle,
              { backgroundColor: isVotingOpen ? theme.greenLight : theme.red },
            ]}
          />
          <Text style={{ fontSize: 12 }}>{isVotingOpen ? 'Votação aberta!' : 'Votação encerrada!'}</Text>
        </View>
      </View>

      <Modal visible={!!showVoters} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000000aa' }}>
          <View style={{ backgroundColor: theme.white, margin: 20, padding: 16, borderRadius: 12, maxHeight: '80%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
              Votos em: {showVoters?.option}
            </Text>

            {loadingUsers ? (
              <ActivityIndicator size="large" color={theme.greenLight} style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {voterUsers.map((item) => (
                  <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                    <Image
                      source={{
                        uri: item.profilePhoto || `https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png`
                      }}
                      style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                    />
                    <Text>{item.name || `Usuário #${item.id}`}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity onPress={() => setShowVoters(null)} style={{ marginTop: 16, alignSelf: 'flex-end' }}>
              <Text style={{ color: theme.greenLight }}>Fechar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%'
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  boxShadow:{
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});
