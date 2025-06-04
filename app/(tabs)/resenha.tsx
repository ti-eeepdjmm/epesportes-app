import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ResenhaCard } from '@/components/resenha/ResenhaCard';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useSocket } from '@/contexts/SocketContext';
import { TimelinePostType } from '@/types';
import { AppLoader } from '@/components/AppLoader';
import { HomeHeader } from '@/components/HomeHeader';

export default function ResenhaScreen() {
  const theme = useTheme();
  const { socket } = useSocket();
  const {
    posts,
    updatePost,
    fetchPosts,
    initialLoading,
    setInitialLoading,
  } = useTimelineStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (initialLoading) {
      fetchPosts().finally(() => setInitialLoading(false));
    }
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

  if (initialLoading) {
    return (
      <View style={styles(theme).loader}>
        <AppLoader visible />
      </View>
    );
  }

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
      <HomeHeader />
      {posts.length === 0 ? (
        <Text style={[styles(theme).emptyText, { color: theme.gray }]}>
          Nenhuma postagem por aqui ainda...
        </Text>
      ) : (
        posts.map((post) => <ResenhaCard key={post._id} post={post} />)
      )}
    </ScrollView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    loader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 14,
      marginTop: 40,
      fontStyle: 'italic',
    },
  });
