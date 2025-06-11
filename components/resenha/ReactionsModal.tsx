import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SvgCssUri } from 'react-native-svg/css';
import { TimelinePostType, User } from '@/types';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { reactionIcons } from '@/constants/reactions';
import { useTheme } from '@/hooks/useTheme';

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

  useEffect(() => {
    if (!visible) return;

    const collected: UserReaction[] = [];

    let allUsersLoaded = true;

    Object.entries(post.reactions).forEach(([reaction, userIds]) => {
      userIds.forEach((id) => {
        collected.push({ userId: id, reaction: reaction as keyof typeof reactionIcons });
        if (!users[id]) {
          getUserById(id); // busca apenas se ainda não está no store
          allUsersLoaded = false;
        }
      });
    });

    setUserReactions(collected);
    setLoading(!allUsersLoaded);
  }, [visible, post.reactions]);


  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.white }]}>
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

          {/* Botão de fechar */}
          <TouchableOpacity onPress={onClose} style={[styles.closeButton]}>
            <Text style={{ color: theme.greenLight }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    maxHeight: '60%',
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  closeButton: {
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
