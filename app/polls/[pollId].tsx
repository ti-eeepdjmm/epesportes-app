import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/utils/api';
import { formatTimestamp } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface PollDetail {
    id: string;
    question: string;
    options: { option: string; votes: number }[];
    expiration: string;
    totalVotes: number;
}

const handleBack = () => {
    router.back();
};


export default function PollScreen() {
    const { pollId } = useLocalSearchParams<{ pollId: string }>();
    const [poll, setPoll] = useState<PollDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();

    useEffect(() => {
        if (!pollId) return;
        (async () => {
            try {
                const res = await api.get<PollDetail>(`/polls/${pollId}`);
                setPoll(res.data);
            } catch {
                setError('Erro ao carregar enquete.');
            } finally {
                setLoading(false);
            }
        })();
    }, [pollId]);

    if (loading) {
        return (
            <View style={styles(theme).center}>
                <ActivityIndicator />
            </View>
        );
    }
    if (error || !poll) {
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
            <Text style={styles(theme).title}>{poll.question}</Text>
            {poll.options.map((opt, idx) => (
                <View key={`${opt.option}-${idx}`} style={styles(theme).option}>
                    <Text style={styles(theme).optionText}>{opt.option}</Text>
                    <Text style={styles(theme).votes}>{opt.votes} votos</Text>
                </View>
            ))}
            <Text style={styles(theme).total}>Total de votos: {poll.totalVotes}</Text>
            <Text style={styles(theme).expiration}>Encerra em: {formatTimestamp(poll.expiration, { includeTime: true, hideSeconds: true })}</Text>
        </ScrollView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: { flexGrow: 1, padding: 16, backgroundColor: '#fff' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    expiration: { fontSize: 14, color: '#555', marginBottom: 16 },
    option: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    optionText: { fontSize: 16 },
    votes: { fontSize: 16, fontWeight: '600' },
    total: { marginTop: 16, fontSize: 14, color: '#333', fontWeight: '500' },
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