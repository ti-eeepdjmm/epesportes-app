import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SvgCssUri } from 'react-native-svg/css';
import { reactionIcons } from '@/constants/reactions';
import { TimelinePostType } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Separator } from '../Separator';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useAuth } from '@/contexts/AuthContext';
import { ReactionsModal } from './ReactionsModal';
import { CommentsModal } from './commentsModal';

const reactionLabels = {
  liked: 'Curtir',
  beast: 'Brabo',
  plays_great: 'Jogou Muito',
  amazing_goal: 'Golaço',
  stylish: 'Tirou onda',
};

const reactionColors = {
  liked: '#0E7E3F',
  beast: '#F4A261',
  plays_great: '#008AEE',
  amazing_goal: '#FF5126',
  stylish: '#D17A22',
};

interface Props {
  post: TimelinePostType;
  onReactPress?: (postId: string) => void;
  onCommentPress?: (postId: string) => void;
}

export const ResenhaCard: React.FC<Props> = ({ post, onReactPress, onCommentPress }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const reactionAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const timeAgo = formatDistanceToNow(new Date(post.postDate), {
    addSuffix: true,
    locale: ptBR,
  }).replace('há cerca de', 'há').replace('em cerca de', 'em');

  const theme = useTheme();
  const { user } = useAuth();
  const reactionTypes = Object.keys(post.reactions) as (keyof typeof post.reactions)[];
  const { reactToPost, addCommentToPost, users, getUserById } = useTimelineStore();
  const author = users[post.userId];

  useEffect(() => {
    if (!author) getUserById(post.userId);
  }, [author, post.userId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [post._id, post.comments.length, JSON.stringify(post.reactions)]);

  useEffect(() => {
    Animated.timing(reactionAnim, {
      toValue: showReactions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showReactions]);

  useEffect(() => {
    if (showReactions) {
      const timeout = setTimeout(() => setShowReactions(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [showReactions]);

  const handleReaction = (reaction: keyof typeof reactionIcons) => {
    if (!user) return;
    reactToPost(post._id, reaction, user.id);
    setShowReactions(false);
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !user) return;
    setLoadingComment(true);
    const comment = newComment;
    setNewComment('');
    await addCommentToPost(post._id, comment, user.id);
    setLoadingComment(false);
  };

  useEffect(() => {
    post.comments.forEach((comment) => {
      if (!users[comment.userId]) {
        getUserById(comment.userId);
      }
    });
  }, [post.comments, users]);


  return (
    <Animated.View
      style={[styles.card, styles.boxShadow, {
        backgroundColor: theme.white,
        borderColor: theme.grayLight,
        opacity: fadeAnim,
      }]}
    >
      <View style={styles.header}>
        <Image
          source={{ uri: author?.profilePhoto || 'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png' }}
          style={styles.avatar}
        />
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.author, { color: theme.black }]}>{author?.name || 'Usuário'}</Text>
            <Text style={[styles.author, { color: theme.gray, fontSize: 12 }]}>{`@${author?.username}` || ''}</Text>
          </View>
          <Text style={[styles.time, { color: theme.greenLight }]}>{timeAgo}</Text>
        </View>
      </View>

      <Text style={[styles.content, { color: theme.black }]}>{post.content}</Text>

      <View style={styles.reactionsRow}>
        {reactionTypes.map((type) => {
          const count = post.reactions[type].length;
          if (count === 0) return null;

          return (
            <TouchableOpacity key={type} style={styles.reactionItem} onPress={() => setShowReactionsModal(true)}>
              <SvgCssUri uri={reactionIcons[type]} width={24} height={24} />
              <Text style={[styles.reactionCount, { color: theme.black }]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showReactions && (
        <Animated.View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 8,
            backgroundColor: theme.grayLight,
            padding: 8,
            borderRadius: 8,
            opacity: reactionAnim,
            transform: [
              {
                scale: reactionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }}
        >
          {Object.keys(reactionIcons).map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleReaction(key as keyof typeof reactionIcons)}
              style={{ alignItems: 'center', gap: 4 }}
            >
              <SvgCssUri uri={reactionIcons[key as keyof typeof reactionIcons]} width={32} height={32} />
              <Text style={{ fontSize: 12, color: theme.black }}>{reactionLabels[key as keyof typeof reactionIcons]}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      <Separator style={{ marginVertical: 8 }} />
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => setShowReactions((prev) => !prev)} style={styles.actionContainer}>
          {(() => {
            const userReaction = Object.entries(post.reactions).find(
              ([_, userIds]) => userIds.includes(user?.id ?? -1),
            )?.[0] as keyof typeof reactionIcons | undefined;

            const reactionColor = userReaction ? reactionColors[userReaction] : theme.greenLight;

            if (userReaction) {
              return (
                <>
                  <SvgCssUri uri={reactionIcons[userReaction]} width={24} height={24} />
                  <Text style={[styles.actionButton, { color: reactionColor }]}>
                    {reactionLabels[userReaction]}
                  </Text>
                </>
              );
            }

            return (
              <>
                <SvgCssUri
                  uri={'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/logos/like-icon.svg'}
                  width={24}
                  height={24}
                />
                <Text style={[styles.actionButton, { color: theme.greenLight }]}>Reagir</Text>
              </>
            );
          })()}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowCommentsModal(true)} style={styles.actionContainer}>
          <SvgCssUri
            uri={'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/logos/chat-icon.svg'}
            width={24}
            height={24}
          />
          <Text style={[styles.actionButton, { color: theme.greenLight }]}>Comentar</Text>
        </TouchableOpacity>

      </View>
      {post.comments.length > 0 && !showCommentsModal && (
        <TouchableOpacity onPress={() => setShowCommentsModal(true)}>
          <Text style={{ color: theme.gray, marginTop: 12 }}>
            Ver todos os {post.comments.length} comentários
          </Text>
        </TouchableOpacity>
      )}

      <ReactionsModal
        post={post} visible={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
      />
      <CommentsModal
        postId={post._id}
        visible={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
      />

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
