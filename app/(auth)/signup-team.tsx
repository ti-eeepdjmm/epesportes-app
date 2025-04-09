import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useTheme } from '@/hooks/useTheme';
import { useSignUp } from '@/contexts/SignUpContext';
import { ComboBoxField as SelectField } from '@/components/forms/ComboBoxField';
import { CheckBox } from '@/components/forms/CheckBox';
import { InputField } from '@/components/forms/InputField';
import { Button } from '@/components/forms/Button';
import api from '@/utils/api';
import { router } from 'expo-router';
import { StyledText } from '@/components/StyledText';
import { AppLoader } from '@/components/AppLoader';

const schema = z
  .object({
    team: z.union([z.string(), z.number()])
      .refine((val) => val !== '', { message: 'Escolha um time' })
      .transform((val) => String(val)),

    modality: z.union([z.string(), z.number()])
      .optional()
      .transform((val) => (val !== undefined ? String(val) : '')),

    isAthlete: z.boolean(),
    position: z.string().optional(),
    shirtNumber: z
      .string()
      .refine((val) => val === '' || /^[0-9]{1,2}$/.test(val), {
        message: 'Informe um número entre 1 e 99',
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isAthlete) {
      if (!data.modality) {
        ctx.addIssue({
          path: ['modality'],
          code: z.ZodIssueCode.custom,
          message: 'Escolha uma modalidade',
        });
      }
      if (!data.position) {
        ctx.addIssue({
          path: ['position'],
          code: z.ZodIssueCode.custom,
          message: 'Escolha uma posição',
        });
      }
      if (!data.shirtNumber) {
        ctx.addIssue({
          path: ['shirtNumber'],
          code: z.ZodIssueCode.custom,
          message: 'Informe o número da camisa',
        });
      }
    }
  });

type FormData = z.infer<typeof schema>;

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

  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAthlete = watch('isAthlete');
  const gamesList = games; // já vem do banco
  const selectedModalityId = watch('modality');
  const selectedModalityName = gamesList.find(
    (game) => String(game.id) === String(selectedModalityId)
  )?.name || '';
  
  const availablePositions = positionOptions[selectedModalityName] ?? [];
  const hasShirtNumber = ['Futsal', 'Handebol', 'Vôlei'].includes(selectedModalityName);

  //reset position when modality changes
  useEffect(() => {
    setValue('position', '');
  }, [selectedModalityId]);

  // Reset and clear fields when isAthlete changes
  useEffect(() => {
    if (!isAthlete) {
      setValue('modality', '');
      setValue('position', '');
      setValue('shirtNumber', '');
    }
  }, [isAthlete]);


  // Fetch teams and games data from the API
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
      } finally {
        setIsLoading(false); 
      }
    }

    fetchData();
  }, []);

  async function onSubmit(formData: FormData) {
    try {
      const {
        name,
        email,
        password,
        birthdate,
      } = data;

      const {
        team,
        isAthlete,
        modality,
        position,
        shirtNumber,
      } = formData;
       
      //  console.log('formData', formData);
      //  console.log('data', data);
      // 1. Cria usuário no Supabase Auth
      await api.post('/auth/register', {
        full_name: name,
        email,
        password,
      });



      // 2. Cadastra na tabela users
      const { data: userData } = await api.post('/users', {
        name,
        email,
        password, // pode estar criptografado no backend
        favoriteTeam: team,
        profilePhoto: '', // se tiver
        isAthlete,
        birthDate: birthdate,
      });

      const userId = userData.id;
      // 3. Se for atleta, cadastra também na tabela players
      if (isAthlete && modality && position && shirtNumber) {
        await api.post('/players', {
          userId,
          position,
          jerseyNumber: shirtNumber,
          gameId: Number(modality), // ← garante que seja número
          teamId: Number(team),
        });
      }

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      reset();
      router.push('/(auth)/login');
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
        options={teams.map((team) => ({
          label: team.name,
          value: team.id,
        }))}
      />

      <View style={{ marginBottom: 16 }}>
        <CheckBox
          label="Sou atleta"
          value={isAthlete}
          onChange={(val: boolean) => setValue('isAthlete', val)}
        />
      </View>

      {isAthlete && (
        <>
          <SelectField
            name="modality"
            label="Modalidade"
            control={control}
            options={games.map((game) => ({
              label: game.name,
              value: game.id,
            }))}
          />

          {availablePositions.length > 0 && (
            <SelectField
              name="position"
              label="Posição"
              control={control}
              options={availablePositions}
            />
          )}

          {hasShirtNumber && (
            <InputField
              name="shirtNumber"
              label="Número da camisa"
              placeholder="Ex: 10"
              control={control}
              keyboardType="numeric"
            />
          )}
        </>
      )}

      <Button
        title="Criar Conta"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={{ marginTop: 24 }}
      />
      <AppLoader visible={isLoading} />
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
