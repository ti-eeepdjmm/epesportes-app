import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppLoader } from '@/components/AppLoader';
import { PollCard } from '@/components/polls/PollCard';
import { useAuth } from '@/contexts/AuthContext';
import { Poll, User, Team } from '@/types';
import { usePolls } from '@/hooks/usePolls';



export default function PollScreen() {
    const { pollId } = useLocalSearchParams<{ pollId: string }>();
    const theme = useTheme();
    const { user } = useAuth();

    const { polls, loading: pollLoading, voteOnPoll } = usePolls(user?.id || null);


    const handleBack = () => router.dismiss();

    if (pollLoading) {
        return (
            <View style={styles(theme).center}>
                <AppLoader visible />
            </View>
        );
    }

    if (!polls || !user) {
        return (
            <View style={styles(theme).center}>
                <Text style={styles(theme).error}>{'Enquete não encontrada.'}</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles(theme).container}>
            <View style={styles(theme).topBar}>
                <TouchableOpacity onPress={handleBack} style={styles(theme).backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.black} />
                </TouchableOpacity>
                <Text style={[styles(theme).title, { color: theme.black }]}>Enquete</Text>
            </View>
            {polls.map((poll) => poll.id == pollId && (
                    <PollCard
                      key={poll.id}
                      poll={poll}
                      currentUserId={user.id}
                      onVote={(option) => voteOnPoll(poll.id, option, user)}
                      shadowOn={false}
             />
         ))}
        </ScrollView>
    );
}

const styles = (theme: any) =>
    StyleSheet.create({
        container: {
            flexGrow: 1,
            paddingVertical: 16,
            backgroundColor: theme.white,
            paddingHorizontal: 8,
        },
        center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
        title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
        error: { color: 'red', fontSize: 16 },
        topBar: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        backButton: {
            marginRight: 12,
        },
    });
