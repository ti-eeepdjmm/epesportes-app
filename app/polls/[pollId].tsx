import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppLoader } from '@/components/AppLoader';
import { PollCard } from '@/components/polls/PollCard';
import { useAuth } from '@/contexts/AuthContext';
import { Poll, User } from '@/types';

export default function PollScreen() {
    const { pollId } = useLocalSearchParams<{ pollId: string }>();
    const [poll, setPoll] = useState<Poll | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();
    const { user } = useAuth();

    useEffect(() => {
        if (!pollId) return;
        (async () => {
            try {
                const res = await api.get<Omit<Poll, 'avatarsByOption'>>(`/polls/${pollId}`);
                const pollData = res.data;
                const avatarsByOption: Record<string, User[]> = {};
                for (const opt of pollData.options) {
                    const users = await Promise.all(
                        opt.userVotes.map((id) => api.get(`/users/${id}`).then(res => res.data))
                    );
                    avatarsByOption[opt.value] = users;
                }
                setPoll({ ...pollData, avatarsByOption });
            } catch {
                setError('Erro ao carregar enquete.');
            } finally {
                setLoading(false);
            }
        })();
    }, [pollId]);

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <View style={styles(theme).center}>
                <AppLoader visible />
            </View>
        );
    }

    if (error || !poll || !user) {
        return (
            <View style={styles(theme).center}>
                <Text style={styles(theme).error}>{error || 'Enquete não encontrada.'}</Text>
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
            <PollCard
                poll={poll}
                currentUserId={user.id}
                shadowOn={false}
                onVote={async (option) => {
                    // Atualização otimista
                    setPoll(prevPoll => {
                        if (!prevPoll) return prevPoll;

                        const updatedOptions = prevPoll.options.map(opt => {
                            let userVotes = [...opt.userVotes];
                            if (opt.value === option) {
                                if (!userVotes.includes(user.id)) userVotes.push(user.id);
                            } else {
                                userVotes = userVotes.filter(id => id !== user.id);
                            }
                            return { ...opt, userVotes };
                        });

                        const avatarsByOption = { ...prevPoll.avatarsByOption };
                        Object.keys(avatarsByOption).forEach(key => {
                            avatarsByOption[key] = avatarsByOption[key].filter(u => u.id !== user.id);
                            if (key === option) avatarsByOption[key].push(user);
                        });

                        const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.userVotes.length, 0);

                        return {
                            ...prevPoll,
                            options: updatedOptions,
                            avatarsByOption,
                            totalVotes,
                        };
                    });

                    try {
                        await api.post(`/polls/${poll.id}/vote`, {
                            userId: user.id,
                            option,
                        });
                    } catch (error) {
                        console.warn('Erro ao votar. Pode implementar rollback aqui se desejar.');
                    }
                }}
            />
        </ScrollView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: { 
        flexGrow: 1, 
        paddingVertical: 16, 
        backgroundColor: theme.white,
        paddingHorizontal:8
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
