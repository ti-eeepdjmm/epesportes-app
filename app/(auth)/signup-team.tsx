import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useTheme } from '@/hooks/useTheme';
import { useSignUp } from '@/contexts/SignUpContext';
import { ComboBoxField as SelectField } from '@/components/forms/ComboboxField';
import { CheckboxGroup } from '@/components/forms/CheckBox';
import { InputField } from '@/components/forms/InputField';
import { Button } from '@/components/forms/Button';
import api from '@/utils/api';
import { router } from 'expo-router';
import { StyledText } from '@/components/StyledText';

const schema = z.object({
  team: z.string().nonempty('Escolha um time'),
  isAthlete: z.boolean(),
  modality: z.string().optional(),
  position: z.string().optional(),
  shirtNumber: z
    .string()
    .refine((val) => val === '' || /^[0-9]{1,2}$/.test(val), {
      message: 'Informe um número entre 1 e 99',
    })
    .optional(),
});

type FormData = z.infer<typeof schema>;

const positionOptions: Record<string, string[]> = {
  Futsal: ['Goleiro', 'Fixo', 'Ala', 'Pivô'],
  Handebol: ['Goleiro', 'Armador', 'Ponta', 'Pivô'],
  Vôlei: ['Levantador', 'Oposto', 'Central', 'Ponteiro', 'Líbero'],
};

export default function SignUpTeamScreen() {
  const theme = useTheme();
  const { data, reset } = useSignUp();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      team: '',
      isAthlete: false,
      modality: '',
      position: '',
      shirtNumber: '',
    },
  });

  const isAthlete = watch('isAthlete');
  const selectedModality = watch('modality') || '';
  const availablePositions = positionOptions[selectedModality] ?? [];

  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);

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
        console.error('Erro ao buscar dados:', error);
      }
    }

    fetchData();
  }, []);

  async function onSubmit(formData: FormData) {
    try {
      const payload = {
        ...data,
        ...formData,
      };

      await api.post('/auth/register', payload);

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      reset();
      router.replace('/login');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Erro ao criar conta. Tente novamente.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles(theme).container}>
      <StyledText style={styles(theme).title}>Escolha seu Time</StyledText>
      <SelectField
        name="team"
        label="Time favorito"
        control={control}
        options={teams.map((team) => team.name)}
      />

      <View style={{ marginBottom: 16 }}>
        <CheckboxGroup
          label="Sou atleta"
          value={isAthlete}
          onChange={(val) => setValue('isAthlete', val)}
        />
      </View>

      {isAthlete && (
        <>
          <SelectField
            name="modality"
            label="Modalidade"
            control={control}
            options={games.map((game) => game.name)}
          />

          {availablePositions.length > 0 && (
            <SelectField
              name="position"
              label="Posição"
              control={control}
              options={availablePositions}
            />
          )}

          <InputField
            name="shirtNumber"
            label="Número da camisa"
            placeholder="Ex: 10"
            control={control}
            keyboardType="numeric"
          />
        </>
      )}

      <Button
        title="Criar Conta"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={{ marginTop: 24 }}
      />
    </ScrollView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 24,
      paddingVertical: 120,
      backgroundColor: theme.white,
    },
    title: {
      fontSize: 32,
      textAlign: 'center',
      marginBottom: 40,
      fontWeight: 'bold',
      color: theme.greenLight
    },
  });
