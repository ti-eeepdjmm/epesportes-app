// src/components/profile/EditProfileForm.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyledText } from '@/components/StyledText';
import { InputField } from '@/components/forms/InputField';
import { Button } from '@/components/forms/Button';
import { ComboBoxField as SelectField } from '@/components/forms/ComboBoxField';
import { useTheme } from '@/hooks/useTheme';
import { Game, Player, Team, User } from '@/types';
import api from '@/utils/api';

const individualGames = ['tênis de mesa', 'xadrez'];

const positionsBySport: Record<string, { label: string; value: string }[]> = {
  futsal: [
    { label: 'Goleiro', value: 'goleiro' },
    { label: 'Fixo', value: 'fixo' },
    { label: 'Ala', value: 'ala' },
    { label: 'Pivô', value: 'pivo' },
  ],
  vôlei: [
    { label: 'Levantador', value: 'levantador' },
    { label: 'Oposto', value: 'oposto' },
    { label: 'Central', value: 'central' },
    { label: 'Ponteiro', value: 'ponteiro' },
    { label: 'Líbero', value: 'libero' },
  ],
  handebol: [
    { label: 'Goleiro', value: 'goleiro' },
    { label: 'Pivô', value: 'pivo' },
    { label: 'Armador', value: 'armador' },
    { label: 'Ponta', value: 'ponta' },
  ],
};



export default function EditProfileForm({
  user,
  onSave,
  onCancel,
  isEditing,
  setIsEditing,
}: {
  user: User;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}) {
  const theme = useTheme();
  const [games, setGames] = useState<{ label: string; value: string }[]>([]);
  const [teams, setTeams] = useState<{ label: string; value: string }[]>([]);
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [selectedGameLabel, setSelectedGameLabel] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const schema = z
    .object({
      username: z.string().optional(),
      name: z.string().min(3, 'Nome deve ter pelo menos 3 letras'),
      favoriteTeam: z.string().min(1, 'Informe um time válido'),
      gameId: z.string().optional(),
      position: z.string().optional(),
      jerseyNumber: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const isCollective = ['futsal', 'handebol', 'vôlei'].includes(selectedGameLabel);
      if (isCollective) {
        if (!data.position) {
          ctx.addIssue({
            path: ['position'],
            code: z.ZodIssueCode.custom,
            message: 'Escolha uma posição',
          });
        }
        if (!data.jerseyNumber) {
          ctx.addIssue({
            path: ['jerseyNumber'],
            code: z.ZodIssueCode.custom,
            message: 'Informe o número da camisa',
          });
        }
      }
    });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user.username || '',
      name: user.name,
      favoriteTeam: user.favoriteTeam?.id.toString() || '',
      jerseyNumber: '',
      gameId: '',
      position: '',
    },
  });

  const watchedGameId = watch('gameId');

  const handleSave = async (data: any) => {
      const selectedTeam = teams.find(t => t.value === data.favoriteTeam);

      if (!selectedTeam) {
        console.error('Time favorito não encontrado.');
        return;
      }

      const updatedData = {
        ...data,
        favoriteTeam: {
          id: Number(selectedTeam.value),
          name: selectedTeam.label,
        },
      };
      onSave(updatedData);
  };

  const handleClickSave = async () => {
    setFormLoading(true); 
    setIsEditing(false);
  
    try {
      await handleSubmit(handleSave)(); 
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setFormLoading(true);
        const [gamesRes, teamsRes] = await Promise.all([
          api.get<Game[]>('/games'),
          api.get<Team[]>('/teams'),
        ]);

        setGames(gamesRes.data.map((g: Game) => ({ label: g.name, value: String(g.id) })));
        setTeams(teamsRes.data.map((t: Team) => ({ label: t.name, value: String(t.id) })));

        if (user.isAthlete) {
          const res = await api.get<Player>(`/players/user/${user.id}`);
          setPlayerData(res.data);
        }
      } catch (err) {
        console.error('Erro ao carregar dados iniciais', err);
      } finally {
        setFormLoading(false);
      }
    }
    loadData();
  }, [user]);

  useEffect(() => {
    const selectedGame = games.find(g => g.value === watchedGameId);
    const label = selectedGame?.label?.toLowerCase() || '';
    setSelectedGameLabel(label);

    if (isEditing) {
      setValue('position', '');
      setValue('jerseyNumber', '');
      clearErrors(['position', 'jerseyNumber']);
    }
  }, [watchedGameId]);

  useEffect(() => {
    if (!formLoading && games.length && teams.length) {

      if (user.isAthlete && playerData) {
        reset({
          username: user.username || '',
          name: user.name,
          favoriteTeam: user.favoriteTeam?.id.toString() || '',
          jerseyNumber: playerData.jerseyNumber?.toString() || '',
          gameId: playerData.game?.id.toString() || '',
          position: playerData.position || '',
        });
      } else {
        reset({
          username: user.username || '',
          name: user.name,
          favoriteTeam: user.favoriteTeam?.id.toString() || '',
          jerseyNumber: '',
          gameId: '',
          position: '',
        });
      }
    }
  }, [formLoading, games, teams, playerData]);


  const isIndividual = individualGames.includes(selectedGameLabel);
  const positionOptions = positionsBySport[selectedGameLabel] || [];

  return (
    <View style={styles(theme).form}>
      <InputField
        name="username"
        label="@username"
        placeholder="Escolha seu nome de usuário"
        control={control}
        disabled={isEditing}
      />

      <InputField
        name="name"
        label="Nome"
        placeholder="Nome do Usuário"
        control={control}
        disabled={isEditing}
      />

      <SelectField
        name="favoriteTeam"
        label="Time favorito"
        control={control}
        disabled={!isEditing}
        options={teams}
      />

      {user.isAthlete && (
        <View style={{ marginTop: 16 }}>
          <StyledText style={styles(theme).sectionTitle}>Dados de Atleta</StyledText>
          <SelectField
            name="gameId"
            label="Modalidade"
            control={control}
            options={games}
            disabled={!isEditing}
          />
          {!isIndividual && watchedGameId && (
            <>
              <SelectField
                name="position"
                label="Posição"
                control={control}
                disabled={!isEditing}
                options={positionOptions}
              />
              <InputField
                name="jerseyNumber"
                label="Número da camisa"
                placeholder="Ex: 10"
                control={control}
                keyboardType="numeric"
                disabled={isEditing}
              />
            </>
          )}
        </View>
      )}

      {isEditing ? (
        <View style={styles(theme).buttonGroup}>
         <Button title="Salvar" onPress={handleClickSave} disabled={formLoading} />
          <Button title="Cancelar" onPress={() => {
            setIsEditing(false);
            if (playerData) {
              reset({
                username: user.username || '',
                name: user.name,
                favoriteTeam: user.favoriteTeam?.id.toString() || '',
                position: playerData.position || '',
                jerseyNumber: playerData.jerseyNumber?.toString() || '',
                gameId: playerData.game?.id.toString() || '',
              });
            }
          }} />
        </View>
      ) : (
        <StyledText
          style={{ marginTop: 12, color: theme.greenLight, fontFamily: 'Poppins_600SemiBold', fontSize: 16 }}
          onPress={() => setIsEditing(true)}
        >
          {"Editar Informações"}
        </StyledText>
      )}
      {formLoading && (
        <View style={styles(theme).overlay}>
          <ActivityIndicator size="large" color={theme.greenLight} />
        </View>
      )}
    </View>

  );
}

const styles = (theme: any) => StyleSheet.create({
  form: { padding: 16 },
  sectionTitle: { fontSize: 14, color: theme.gray, marginBottom: 4 },
  buttonGroup: { gap: 8, marginTop: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
