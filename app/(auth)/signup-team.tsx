// src/components/profile/EditProfileForm.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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

const positionOptions: Record<string, { label: string; value: string }[]> = {
  Futsal: [
    { label: 'Goleiro', value: 'Goleiro' },
    { label: 'Fixo', value: 'Fixo' },
    { label: 'Ala', value: 'Ala' },
    { label: 'Pivô', value: 'Pivô' },
  ],
  Handebol: [
    { label: 'Goleiro', value: 'Goleiro' },
    { label: 'Armador', value: 'Armador' },
    { label: 'Ponta', value: 'Ponta' },
    { label: 'Pivô', value: 'Pivô' },
  ],
  Vôlei: [
    { label: 'Levantador', value: 'Levantador' },
    { label: 'Oposto', value: 'Oposto' },
    { label: 'Central', value: 'Central' },
    { label: 'Ponteiro', value: 'Ponteiro' },
    { label: 'Líbero', value: 'Líbero' },
  ],
};

const individualGames = ['Tênis de Mesa', 'Xadrez'];

export default function EditProfileForm({
  user,
  playerData,
  onSave,
  onCancel,
  isEditing,
  setIsEditing,
}: {
  user: User;
  playerData?: Player;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}) {
  const theme = useTheme();
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);

  const schema = z
    .object({
      username: z.string().optional(),
      name: z.string().min(3, 'Nome deve ter pelo menos 3 letras'),
      favoriteTeam: z.union([z.string(), z.number()])
        .refine((val) => val !== '', { message: 'Escolha um time' })
        .transform((val) => String(val)),
      gameId: z.union([z.string(), z.number()])
        .optional()
        .transform((val) => (val !== undefined ? String(val) : '')),
      position: z.string().optional(),
      jerseyNumber: z
        .string()
        .refine((val) => val === '' || /^[0-9]{1,2}$/.test(val), {
          message: 'Informe um número entre 1 e 99',
        })
        .optional(),
    })
    .superRefine((data, ctx) => {
      const selectedModality = games.find(
        (game) => String(game.id) === String(data.gameId)
      )?.name || '';

      const isColetivo = ['Futsal', 'Handebol', 'Vôlei'].includes(selectedModality);
      if (user.isAthlete && selectedModality && isColetivo) {
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
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user.username || '',
      name: user.name,
      favoriteTeam: user.favoriteTeam?.toString() ?? '',
      gameId: playerData?.game.id.toString() ?? '',
      position: playerData?.position ?? '',
      jerseyNumber: playerData?.jerseyNumber?.toString() ?? '',
    },
  });

  const selectedGameId = watch('gameId');
  const selectedGameName = games.find((g) => String(g.id) === selectedGameId)?.name || '';
  const positionList = positionOptions[selectedGameName] || [];
  const isCollective = ['Futsal', 'Handebol', 'Vôlei'].includes(selectedGameName);

  useEffect(() => {
    setValue('position', '');
    setValue('jerseyNumber', '');
  }, [selectedGameId]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsRes, gamesRes] = await Promise.all([
          api.get('/teams'),
          api.get('/games'),
        ]);
        setTeams(teamsRes.data);
        setGames(gamesRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }
    fetchData();
  }, []);

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    onCancel();
  };

  return (
    <View style={styles(theme).form}>
      <InputField
        name="username"
        label="@username"
        placeholder="Escolha seu nome de usuário"
        control={control}
        disabled={!isEditing}
      />
      <InputField
        name="name"
        label="Nome"
        placeholder="Nome do Usuário"
        control={control}
        disabled={!isEditing}
      />
      <SelectField
        name="favoriteTeam"
        label="Time favorito"
        control={control}
        disabled={!isEditing}
        options={teams.map((t) => ({ label: t.name, value: String(t.id) }))}
      />

      {user.isAthlete && (
        <View style={{ marginTop: 16 }}>
          <StyledText style={styles(theme).sectionTitle}>Dados de Atleta</StyledText>
          <SelectField
            name="gameId"
            label="Modalidade"
            control={control}
            options={games.map((g) => ({ label: g.name, value: String(g.id) }))}
            disabled={!isEditing}
          />
          {isCollective && (
            <>
              <SelectField
                name="position"
                label="Posição"
                control={control}
                options={positionList}
                disabled={!isEditing}
              />
              <InputField
                name="jerseyNumber"
                label="Número da camisa"
                placeholder="Ex: 10"
                control={control}
                keyboardType="numeric"
                disabled={!isEditing}
              />
            </>
          )}
        </View>
      )}

      {isEditing ? (
        <View style={styles(theme).buttonGroup}>
          <Button title="Salvar" onPress={handleSubmit(onSave)} />
          <Button title="Cancelar" onPress={handleCancel} />
        </View>
      ) : (
        <StyledText
          style={{ marginTop: 12, color: theme.greenLight, fontFamily: 'Poppins_600SemiBold', fontSize: 16 }}
          onPress={() => setIsEditing(true)}
        >
          Editar Informações
        </StyledText>
      )}
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  form: { padding: 16 },
  sectionTitle: { fontSize: 14, color: theme.gray, marginBottom: 4 },
  buttonGroup: { gap: 8, marginTop: 16 },
});
