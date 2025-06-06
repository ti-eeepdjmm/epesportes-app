import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Animated, 
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SvgCssUri } from 'react-native-svg/css';
import { reactionIcons } from '@/constants/reactions';
import { TimelinePostType } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Separator } from '../Separator';
import { useTimelineStore } from '@/stores/useTimelineStore';

interface Props {
  post: TimelinePostType;
  onReactPress?: (postId: string) => void;
  onCommentPress?: (postId: string) => void;
}

export const ResenhaCard: React.FC<Props> = ({ post, onReactPress, onCommentPress }) => {
  const timeAgoRaw = formatDistanceToNow(new Date(post.postDate), {
    addSuffix: true,
    locale: ptBR,
  });

  const timeAgo = timeAgoRaw
  .replace('há cerca de', 'há')
  .replace('em cerca de', 'em');

  const theme = useTheme();
  const reactionTypes = Object.keys(post.reactions) as (keyof typeof post.reactions)[];
  const { getUserById, users } = useTimelineStore();
  const user = users[post.userId];

  const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true,
  }).start();
}, [post._id, post.comments.length, JSON.stringify(post.reactions)]);


  useEffect(() => {
    if (!user) {
      getUserById(post.userId);
    }
  }, [user, post.userId]);

  return (
   <Animated.View
      style={[
        styles.card,
        styles.boxShadow,
        { backgroundColor: theme.white, borderColor: theme.grayLight, opacity: fadeAnim },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: user?.profilePhoto || 'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png' }}
          style={styles.avatar}
        />
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.author, { color: theme.black }]}>{user?.name || 'Usuário'}</Text>
            <Text style={[styles.author, { color: theme.gray, fontSize:12 }]}>{`@${user?.username}` || ''}</Text>
          </View>
          <Text style={[styles.time, { color: theme.greenLight }]}>{timeAgo}</Text>
        </View>
      </View>

      {/* Conteúdo */}
      <Text style={[styles.content, { color: theme.black }]}>{post.content}</Text>

      {/* Reações */}
      <View style={styles.reactionsRow}>
        {reactionTypes.map((type) => {
          const count = post.reactions[type].length;
          if (count === 0) return null;

          return (
            <View key={type} style={styles.reactionItem}>
              <SvgCssUri uri={reactionIcons[type]} width={24} height={24} />
              <Text style={[styles.reactionCount, { color: theme.black }]}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Ações */}
      <Separator style={{ marginVertical: 8 }} />
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onReactPress?.(post._id)} style={styles.actionContainer}>
          <SvgCssUri
            uri={'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/logos/like-icon.svg'}
            width={24}
            height={24}
          />
          <Text style={[styles.actionButton, { color: theme.greenLight }]}>Reagir</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onCommentPress?.(post._id)} style={styles.actionContainer}>
          <SvgCssUri
            uri={'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/logos/chat-icon.svg'}
            width={24}
            height={24}
          />
          <Text style={[styles.actionButton, { color: theme.greenLight }]}>Comentar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
  },
  boxShadow: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  author: {
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
  },
  content: {
    marginVertical: 8,
    fontSize: 14,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionCount: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 40,
    marginTop: 12,
  },
  actionButton: {
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
