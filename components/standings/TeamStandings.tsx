import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import api from '@/utils/api';
import { router } from 'expo-router';
import { SvgCssUri } from 'react-native-svg/css';
import { TeamStanding } from '@/types';

interface Props {
    full?: boolean;
}

export const TeamStandings: React.FC<Props> = ({
    full = false,
}) => {
    const theme = useTheme();
    const [standings, setStandings] = useState<TeamStanding[]>([]);

    useEffect(() => {
        fetchStandings();
    }, []);

    const fetchStandings = async () => {
        try {
            const { data } = await api.get('/team-standings/ordered');
            const finalData = full? data : data.slice(0, 4)
            setStandings(finalData);
        } catch (error) {
            console.error('Erro ao buscar classificação:', error);
        }
    };

    const getBorderColor = (index: number, total: number) => {
        if (index < 4) return theme.yellow;
        if (index >= total - 2) return theme.red;
        return theme.greenLight;
    };

    return (
        <View style={[styles.container, styles.boxShadow, { backgroundColor: theme.white, borderColor: theme.grayLight }]}>
            <Text style={[styles.title, { color: theme.black }]}>Classificação</Text>
            <Text style={[styles.subtitle, { color: theme.gray }]}>Tabela</Text>

            <View style={[styles.tableContainer]}>
                <View style={[styles.tableHeader, { borderColor: theme.grayLight }]}>
                    <Text style={[styles.columnEquipe, { color: theme.black }]}>Equipe</Text>
                    {['P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG'].map((label) => (
                        <Text key={label} style={[styles.headerText, { color: theme.black }]}>
                            {label}
                        </Text>
                    ))}
                </View>

                {standings.map((item, index) => (
                    <View
                        key={item.team.id}
                        style={[
                            styles.tableRow,
                            { 
                                borderBottomColor: theme.grayBackground,
                                borderLeftWidth: 4,
                                borderLeftColor: getBorderColor(index, standings.length), 
                            }
                        ]}
                    >
                        <View style={styles.teamCell}>
                            <Text style={[styles.positionText, { color: theme.black }]}>{index + 1}º</Text>
                            <SvgCssUri uri={item.team.logo} width={24} height={24} />
                            <Text style={[styles.teamName, { color: theme.black }]}>{item.team.name}</Text>
                        </View>
                        <Text style={[styles.cellText, { color: theme.black, fontWeight: '700' }]}>{item.points}</Text>
                        <Text style={[styles.cellText, { color: theme.black }]}>{(item.wins + item.losses + item.draws)}</Text>
                        <Text style={[styles.cellText, { color: theme.black }]}>{item.wins}</Text>
                        <Text style={[styles.cellText, { color: theme.black }]}>{item.draws}</Text>
                        <Text style={[styles.cellText, { color: theme.black }]}>{item.losses}</Text>
                        <Text style={[styles.cellText, { color: theme.black }]}>{item.goalsScored}</Text>
                        <Text style={[styles.cellText, { color: theme.black }]}>{item.goalsConceded}</Text>
                        <Text style={[styles.cellText, { color: theme.black }]}>{item.goalDifference}</Text>
                    </View>
                ))}
            </View>
            {!full && (  
                <TouchableOpacity onPress={() => router.push('/(tabs)/games')} style={styles.button}>
                    <Text style={[styles.buttonText, { color: theme.greenLight }]}>Ver tabela completa</Text>
                    <Text style={[styles.arrowDown, { color: theme.greenLight }]}>▼</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        marginVertical: 12,
        padding: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 4,
    },
    tableContainer: {
        borderRadius: 8,
        marginTop: 16,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
        width: 16,
    },
    cellText: {
        fontSize: 12,
        textAlign: 'center',
        width: 16,
    },
    columnEquipe: {
        fontSize: 12,
        fontWeight: '700',
        width: 96,
    },
    teamCell: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
        width: 96,
    },
    positionText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        width:20
    },
    teamName: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    button: {
        marginTop: 12,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    arrowDown: {
        fontSize: 20,
        lineHeight: 20,
        marginTop: -2,
    },
    boxShadow: {
        borderWidth: 1,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
