// app/components/polls/PollCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Image } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { StyledText } from '@/components/StyledText';
import { AvatarGroup } from '@/components/AvatarGroup'; // supondo que já tenha
import { useTheme } from '@/hooks/useTheme';
import { Poll, PollOption, User } from '@/types';

interface PollCardProps {
  poll: Poll;
  onVote: (optionId: number) => void;
  userVotedOptionId?: number;
  isVotingOpen: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  onVote,
  userVotedOptionId,
  isVotingOpen,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showVoters, setShowVoters] = useState<PollOption | null>(null);
  const theme = useTheme();

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

  const handleVote = (optionId: number) => {
    if (isVotingOpen && !userVotedOptionId) {
      setSelectedOption(optionId);
      onVote(optionId);
    }
  };

  return (
    <View style={{ backgroundColor: theme.white, borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <StyledText style={{ fontSize: 16, fontWeight: 'bold' }}>{poll.question}</StyledText>
      
      {poll.options.map((option) => {
        const voteCount = option.votes.length;
        const percentage = totalVotes ? (voteCount / totalVotes) : 0;

        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => handleVote(option.id)}
            disabled={!isVotingOpen || !!userVotedOptionId}
            style={{ marginVertical: 8 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {option.image && (
                <Image source={{ uri: option.image }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
              )}
              <StyledText>{option.label}</StyledText>
              <StyledText style={{ marginLeft: 'auto' }}>{(percentage * 100).toFixed(0)}%</StyledText>
            </View>
            <ProgressBar progress={percentage} color={theme.primary} style={{ height: 6, borderRadius: 8, marginTop: 4 }} />
            <TouchableOpacity onPress={() => setShowVoters(option)}>
              <AvatarGroup users={option.votes.map((vote) => vote.user)} />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

      <StyledText style={{ fontSize: 12, marginTop: 8 }}>
        Total de votos: {totalVotes} {isVotingOpen ? '🟢 Votação aberta!' : '⚪ Votação encerrada'}
      </StyledText>

      <Modal visible={!!showVoters} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000000aa' }}>
          <View style={{ backgroundColor: theme.white, margin: 20, padding: 16, borderRadius: 12 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Quem votou em: {showVoters?.label}</Text>
            <FlatList
              data={showVoters?.votes}
              keyExtractor={(item) => String(item.user.id)}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                  <Image source={{ uri: item.user.avatar }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                  <Text>{item.user.name}</Text>
                </View>
              )}
            />
            <TouchableOpacity onPress={() => setShowVoters(null)} style={{ marginTop: 16 }}>
              <Text style={{ color: theme.primary }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
