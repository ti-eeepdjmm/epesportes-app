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
import { Player, User } from '@/types';
import api from '@/utils/api';
import { useAthleteStore } from '@/stores/useAthleteStore';

const individualGames = ['tênis de mesa', 'xadrez'];

const positionsBySport: Record<string, { label: string; value: string }[]> = {
  futsal: [
    { label: 'Goleiro', value: 'goleiro' },
    { label: 'Fixo', value: 'fixo' },
    { label: 'Ala Esquerda', value: 'alaEsquerda' },
    { label: 'Ala Direita', value: 'alaDireita' },
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
  const [selectedGameLabel, setSelectedGameLabel] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { games, teams, player, loadData } = useAthleteStore();

  const schema = z
    .object({
      username: z
        .string()
        .min(3, 'Username deve ter ao menos 3 caracteres')
        .regex(/^[a-z0-9_.]+$/, 'Use apenas letras minúsculas, números, underscore ou ponto')
        .refine(async (username) => {
          try {
            const res = await api.get<{ available: boolean }>(`/users/check-username/${username}`);
            return res.data.available === true;
          } catch (err) {
            return user.username === username;
          }
        }, 'Usename não disponível'),
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
    if (!selectedTeam) return;

    const updatedData = {
      ...data,
      favoriteTeam: {
        id: Number(selectedTeam.value),
        name: selectedTeam.label,
      },
    };

    onSave(updatedData);
    setIsEditing(false);
  };

  const onPressSave = handleSubmit(async data => {
    setFormLoading(true);
    try {
      await handleSave(data);
    } catch (err) {
      console.error('Erro ao verificar username', err);
    } finally {
      setFormLoading(false);
    }
  });

  useEffect(() => {
    if (!games.length || !teams.length || (user.isAthlete && !player)) {
      loadData(user.id, user.isAthlete);
    }
  }, [user.id]);

  useEffect(() => {
    const selectedGame = games.find(g => g.value === watchedGameId);
    const label = selectedGame?.label.toLowerCase() || '';
    setSelectedGameLabel(label);

    if (isEditing) {
      setValue('position', '');
      setValue('jerseyNumber', '');
      clearErrors(['position', 'jerseyNumber']);
    }
  }, [watchedGameId]);

  useEffect(() => {
    if (games.length && teams.length) {
      if (user.isAthlete && player) {
        reset({
          username: user.username || '',
          name: user.name,
          favoriteTeam: user.favoriteTeam?.id.toString() || '',
          jerseyNumber: player.jerseyNumber?.toString() || '',
          gameId: player.game?.id.toString() || '',
          position: player.position || '',
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
  }, [games, teams, player, user]);

  const isIndividual = individualGames.includes(selectedGameLabel);
  const positionOptions = positionsBySport[selectedGameLabel] || [];

  return (
    <View style={styles(theme).form}>
      <InputField name="username" label="@username" placeholder="Escolha seu nome de usuário" control={control} disabled={!isEditing} />
      <InputField name="name" label="Nome" placeholder="Nome do Usuário" control={control} disabled={!isEditing} />
      <SelectField name="favoriteTeam" label="Time favorito" control={control} disabled={!isEditing} options={teams} />

      {user.isAthlete && (
        <View style={{ marginTop: 16 }}>
          <StyledText style={styles(theme).sectionTitle}>Dados de Atleta</StyledText>
          <SelectField name="gameId" label="Modalidade" control={control} options={games} disabled={!isEditing} />
          {!isIndividual && watchedGameId && (
            <>
              <SelectField name="position" label="Posição" control={control} disabled={!isEditing} options={positionOptions} />
              <InputField name="jerseyNumber" label="Número da camisa" placeholder="Ex: 10" control={control} keyboardType="numeric" disabled={!isEditing} />
            </>
          )}
        </View>
      )}

      {isEditing ? (
        <View style={styles(theme).buttonGroup}>
          <Button title="Salvar" onPress={onPressSave} disabled={formLoading} />
          <Button title="Cancelar" onPress={onCancel} />
        </View>
      ) : (
        <StyledText
          style={{ marginTop: 12, color: theme.greenLight, fontFamily: 'Poppins_600SemiBold', fontSize: 16 }}
          onPress={() => setIsEditing(true)}>
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

const styles = (theme: any) =>
  StyleSheet.create({
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
