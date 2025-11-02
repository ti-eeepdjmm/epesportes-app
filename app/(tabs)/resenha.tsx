import React, { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
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
    addPost,
    fetchInitialPosts,
    fetchMorePosts,
    initialLoading,
    setInitialLoading,
    hasMore,
    resetTimeline,
  } = useTimelineStore();

  const [refreshing, setRefreshing] = React.useState(false);

  // Carregamento inicial
  useEffect(() => {
    if (initialLoading) {
      fetchInitialPosts().finally(() => setInitialLoading(false));
    }
  }, []);

  // WebSocket para novos posts e updates
  useEffect(() => {
    if (!socket) return;

    const handleTimelineUpdate = (payload: {
      postId: string;
      updatedPost: TimelinePostType;
    }) => {
      updatePost(payload.updatedPost);
    };

    const handleNewPost = (newPost: TimelinePostType) => {
      addPost(newPost);
    };

    socket.on('timeline:update', handleTimelineUpdate);
    socket.on('feed:new-post', handleNewPost);

    return () => {
      socket.off('timeline:update', handleTimelineUpdate);
      socket.off('feed:new-post', handleNewPost);
    };
  }, [socket]);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    resetTimeline();
    await fetchInitialPosts();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (hasMore && !refreshing) {
      await fetchMorePosts();
    }
  };

  if (initialLoading) {
    return (
      <View style={styles(theme).loader}>
        <AppLoader visible />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.white }}
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <ResenhaCard post={item} />}
      ListHeaderComponent={<HomeHeader />}
      ListEmptyComponent={
        <Text style={[styles(theme).emptyText, { color: theme.gray }]}>
          Nenhuma postagem por aqui ainda...
        </Text>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.greenLight]}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
    />
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
