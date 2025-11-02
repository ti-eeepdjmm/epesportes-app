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
  Dimensions,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useTheme } from '@/hooks/useTheme';
import { AvatarGroup } from './AvatarGroup';
import { Poll, PollOption, User } from '@/types';
import { SvgCssUri } from 'react-native-svg/css';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

interface PollCardProps {
  poll: Poll;
  currentUserId: number;
  onVote: (option: string) => void;
  shadowOn?: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  currentUserId,
  onVote,
  shadowOn = true,
}) => {
  const theme = useTheme();
  const [showVoters, setShowVoters] = useState<PollOption | null>(null);
  const [voterUsers, setVoterUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const translateY = useSharedValue(0);

  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (showVoters) {
      translateY.value = screenHeight;
      translateY.value = withSpring(0, { damping: 20 });
    }
  }, [showVoters]);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startY: number }
  >({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      const newValue = ctx.startY + event.translationY;
      // Só permite puxar para baixo
      if (newValue >= 0) {
        translateY.value = newValue;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        runOnJS(setShowVoters)(null);
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const hasVoted = poll.options.some((opt) =>
    opt.userVotes.includes(currentUserId)
  );
  const isVotingOpen = new Date(poll.expiration).getTime() > Date.now();

  const handleVote = (optionValue: string) => {
    if (!hasVoted && isVotingOpen) {
      onVote(optionValue);
    }
  };

  useEffect(() => {
    if (showVoters) {
      setLoadingUsers(true);
      setVoterUsers(poll.avatarsByOption[showVoters.value] || []);
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
        shadowOn ? styles.boxShadow : {},
        {
          backgroundColor: theme.white,
          shadowColor: theme.black,
          borderColor: theme.grayLight,
        },
      ]}
    >
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.black }}>
        {poll.question}
      </Text>

      {poll.options.map((opt) => {
        const percentage = poll.totalVotes
          ? opt.userVotes.length / poll.totalVotes
          : 0;
        const avatars = poll.avatarsByOption[opt.value] || [];
        const isWinner = opt.value === winningOption.value;
        const progressColor = isVotingOpen
          ? theme.greenLight
          : isWinner
            ? theme.greenLight
            : theme.gray;

        return (
          <View key={opt.value}>
            <TouchableOpacity
              onPress={() => handleVote(opt.value)}
              disabled={hasVoted || !isVotingOpen}
              style={{ marginVertical: 10 }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                {opt.image && opt.type === 'team' ? (
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: theme.gray,
                      borderRadius: 32,
                      padding: 2,
                    }}
                  >
                    <SvgCssUri uri={opt.image} width={40} height={40} />
                  </View>
                ) : opt.image ? (
                  <Image
                    source={{ uri: opt.image }}
                    style={{ width: 40, height: 40, borderRadius: 24 }}
                  />
                ) : null}
                <Text style={{ color: theme.black, flex: 1 }}>{opt.label}</Text>
                <Text style={{ color: theme.black }}>
                  {(percentage * 100).toFixed(0)}%
                </Text>
              </View>
              <ProgressBar
                progress={percentage}
                color={progressColor}
                style={{ height: 24, borderRadius: 8, marginTop: 4 }}
              />
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                onPress={() => setShowVoters(opt)}
                style={{ width: '50%' }}
              >
                <AvatarGroup users={avatars} />
              </TouchableOpacity>
              {opt.userVotes.includes(currentUserId) && (
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: theme.greenLight,
                  }}
                >
                  ✔️ Seu voto!
                </Text>
              )}
            </View>
          </View>
        );
      })}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: theme.black,
            fontSize: 12,
            marginTop: 8,
            fontWeight: 'bold',
          }}
        >
          Total de votos: {poll.totalVotes}
        </Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View
            style={[
              styles.circle,
              { backgroundColor: isVotingOpen ? theme.success : theme.error },
            ]}
          />
          <Text style={{ color: theme.black, fontSize: 12 }}>
            {isVotingOpen ? 'Votação aberta!' : 'Votação encerrada!'}
          </Text>
        </View>
      </View>

      {/* Modal com gesto de swipe para baixo */}
      <Modal visible={!!showVoters && voterUsers.length > 0} transparent animationType="fade">
        <GestureHandlerRootView style={stylesModal.overlay}>
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[stylesModal.container, animatedStyle, { backgroundColor: theme.white, minHeight: screenHeight * 0.5, }]}>
              <View style={stylesModal.dragIndicatorWrapper}>
                <View style={[stylesModal.dragIndicator, { backgroundColor: theme.grayLight }]} />
              </View>

              <Text style={[stylesModal.title, { color: theme.black }]}>Votos em: {showVoters?.label}</Text>

              {loadingUsers ? (
                <ActivityIndicator
                  size="large"
                  color={theme.greenLight}
                  style={{ marginVertical: 20 }}
                />
              ) : (
                <FlatList
                  data={voterUsers}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={stylesModal.item}>
                      <Image
                        source={{
                          uri: item.profilePhoto ||
                            `https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png`,
                        }}
                        style={stylesModal.avatar}
                      />
                      <View style={stylesModal.info}>
                        <Text style={[stylesModal.name, { color: theme.black }]}>{item.name}</Text>
                        <Text style={[stylesModal.username, { color: theme.gray }]}>@{item.username}</Text>
                      </View>
                    </View>
                  )}
                />
              )}
            </Animated.View>
          </PanGestureHandler>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  boxShadow: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

const stylesModal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignSelf: 'stretch',
  },
  dragIndicatorWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  dragIndicator: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
  },
  username: {
    fontSize: 12,
  },
});
