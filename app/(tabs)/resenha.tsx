import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { ResenhaCard } from '@/components/resenha/ResenhaCard';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { TimelinePostType } from '@/types';
import api from '@/utils/api';
import { useSocket } from '@/contexts/SocketContext';

export default function ResenhaScreen() {
  const { posts, setPosts, updatePost } = useTimelineStore();
  const [refreshing, setRefreshing] = useState(false);
  const { socket } = useSocket();

  const fetchPosts = async () => {
    try {
      const response = await api.get<TimelinePostType[]>('/timeline-posts');
      setPosts(response.data);
    } catch (err) {
      console.error('Erro ao buscar timeline:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTimelineUpdate = (payload: {
      postId: string;
      updatedPost: TimelinePostType;
    }) => {
      updatePost({ ...payload.updatedPost, _id: payload.postId });
    };

    socket.on('timeline:update', handleTimelineUpdate);

    return () => {
      socket.off('timeline:update', handleTimelineUpdate);
    };
  }, [socket]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ResenhaCard
            post={item}
            onReactPress={() => console.log('Reagir', item._id)}
            onCommentPress={() => console.log('Comentar', item._id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );
}
