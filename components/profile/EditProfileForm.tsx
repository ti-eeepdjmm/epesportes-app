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
import { User } from '@/types';
import api from '@/utils/api';

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 letras'),
  favoriteTeam: z.string().min(2, 'Informe um time válido'),
  position: z.string().optional(),
  jerseyNumber: z.string().optional(),
  gameId: z.string().optional(),
});

const individualGames = ['Tênis de Mesa', 'Xadrez'];

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
  playerData,
  onSave,
  onCancel,
  isEditing,
  setIsEditing,
}: {
  user: User;
  playerData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}) {
  const theme = useTheme();
  const [games, setGames] = useState<{ label: string; value: string }[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user.name,
      favoriteTeam: user.favoriteTeam ?? '',
      position: playerData?.position || '',
      jerseyNumber: playerData?.jerseyNumber?.toString() || '',
      gameId: playerData?.gameId || '',
    },
    resolver: zodResolver(schema),
  });

  const watchedGameId = watch('gameId');

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await api.get('/games');
        const options = res.data.map((g: any) => ({ label: g.name, value: g.id }));
        setGames(options);

        if (playerData?.gameId) {
          const selected = res.data.find((g: any) => g.id === playerData.gameId);
          if (selected) setSelectedGame(selected.name.toLowerCase());
        }
      } catch (err) {
        console.error('Erro ao carregar modalidades');
      }
    }
    if (user.isAthlete) {
      loadGames();
    }
  }, []);

  useEffect(() => {
    if (!watchedGameId) return;
    const selected = games.find((g) => g.value === watchedGameId);
    if (selected) {
      setSelectedGame(selected.label.toLowerCase());
    }
  }, [watchedGameId, games]);

  const isIndividual = individualGames.includes(selectedGame);
  const sportKey = selectedGame.toLowerCase();
  const positionOptions = positionsBySport[sportKey] || [];

  return (
    <View style={styles(theme).form}>
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
        options={[]}
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
          {!isIndividual && (
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
                disabled={!isEditing}
              />
            </>
          )}
        </View>
      )}

      {isEditing ? (
        <View style={styles(theme).buttonGroup}>
          <Button title="Salvar" onPress={handleSubmit(onSave)} />
          <Button title="Cancelar" onPress={() => { setIsEditing(false); onCancel(); }} />
        </View>
      ) : (
        <StyledText 
            style={{ marginTop: 12, color: theme.greenLight, fontFamily: 'Poppins_600SemiBold', fontSize: 16 }} 
            onPress={() => setIsEditing(true)}
        >
                {"Editar Informações"}
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
