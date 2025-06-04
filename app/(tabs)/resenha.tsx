import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ResenhaCard } from '@/components/resenha/ResenhaCard';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useSocket } from '@/contexts/SocketContext';
import { TimelinePostType } from '@/types';

export default function ResenhaScreen() {
  const theme = useTheme();
  const { socket } = useSocket();
  const { posts, updatePost, fetchPosts } = useTimelineStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTimelineUpdate = (payload: {
      postId: string;
      updatedPost: TimelinePostType;
    }) => {
      updatePost(payload.updatedPost);
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
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.white }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.greenLight]}
        />
      }
    >
      {posts.map((post) => (
        <ResenhaCard key={post._id} post={post} />
      ))}
    </ScrollView>
  );
};
