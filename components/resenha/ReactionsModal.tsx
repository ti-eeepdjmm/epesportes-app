import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import { SvgCssUri } from 'react-native-svg/css';
import { TimelinePostType, User } from '@/types';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { reactionIcons } from '@/constants/reactions';
import { useTheme } from '@/hooks/useTheme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';

const screenHeight = Dimensions.get('window').height;
const MODAL_HEIGHT = screenHeight * 0.9; // Aumentado de 0.5 para 0.9

interface Props {
  post: TimelinePostType;
  visible: boolean;
  onClose: () => void;
}

interface UserReaction {
  userId: number;
  reaction: keyof typeof reactionIcons;
}

export const ReactionsModal: React.FC<Props> = ({ post, visible, onClose }) => {
  const [userReactions, setUserReactions] = useState<UserReaction[]>([]);
  const { users, getUserById } = useTimelineStore();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const translateY = useSharedValue(MODAL_HEIGHT);

  // Novo gesture com Gesture API v2
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(translateY.value, [MODAL_HEIGHT, 0], [0, 1]),
  }));

  useEffect(() => {
    if (visible) {
      translateY.value = MODAL_HEIGHT;
      translateY.value = withSpring(0, { damping: 20 });
    } else {
      translateY.value = withSpring(MODAL_HEIGHT);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const collected: UserReaction[] = [];
    let allUsersLoaded = true;

    Object.entries(post.reactions).forEach(([reaction, userIds]) => {
      userIds.forEach((id) => {
        collected.push({ userId: id, reaction: reaction as keyof typeof reactionIcons });
        if (!users[id]) {
          getUserById(id);
          allUsersLoaded = false;
        }
      });
    });

    setUserReactions(collected);
    setLoading(!allUsersLoaded);
  }, [visible, post.reactions]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <GestureHandlerRootView style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            animatedStyle,
            { backgroundColor: theme.white },
          ]}
        >
          <GestureDetector gesture={panGesture}>
            <View style={{ paddingVertical: 8, alignItems: 'center' }}>
              <View style={styles.handleBar} />
            </View>
          </GestureDetector>
          <Text style={[styles.title, { color: theme.black }]}>Reações</Text>
            {loading ? (
              <ActivityIndicator size="large" color={theme.greenLight} style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={userReactions}
                keyExtractor={(item, index) => `${item.userId}-${item.reaction}-${index}`}
                renderItem={({ item }) => {
                  const user: User | undefined = users[item.userId];
                  return (
                    <View style={styles.item}>
                      <Image
                        source={{
                          uri:
                            user?.profilePhoto ||
                            'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png',
                        }}
                        style={styles.avatar}
                      />
                      <View style={styles.info}>
                        <Text style={[styles.name, { color: theme.black }]}>{user?.name || 'Usuário'}</Text>
                        <Text style={[styles.username, { color: theme.gray }]}>@{user?.username || ''}</Text>
                      </View>
                      <SvgCssUri uri={reactionIcons[item.reaction]} width={28} height={28} />
                    </View>
                  );
                }}
              />
            )}
          </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%', // Altura fixa em 90% da tela
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 12,
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
