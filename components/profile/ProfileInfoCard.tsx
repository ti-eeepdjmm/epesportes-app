import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import { User } from '@/types';
import { formatTimestamp } from '@/utils/date';

interface ProfileInfoCardProps {
  user: User;
  onEditPhoto: () => void;
  loading?: boolean;
}

export default function ProfileInfoCard({ user, onEditPhoto, loading = false }: ProfileInfoCardProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
      container: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
      },
      containerAvatar: {
        alignItems: 'center',
        justifyContent: 'center',
        opacity: loading ? 0.6 : 1,
      },
      avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: theme.greenLight,
        alignItems: 'center',
        justifyContent: 'center',
      },
      name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.black,
      },
      handle: {
        fontSize: 14,
        color: theme.gray,
      },
      since: {
        fontSize: 12,
        color: theme.gray,
      },
      link: {
        color: theme.greenLight,
        marginTop: 4,
        fontSize: 14,
      },
    });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onEditPhoto}
        style={styles.containerAvatar}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.avatar}> 
            <ActivityIndicator size="small" color={theme.greenLight} />
          </View>
        ) : (
          <Image
            source={{
              uri:
                user.profilePhoto ||
                'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png',
            }}
            style={styles.avatar}
          />
        )}
        <StyledText style={styles.link}>
          {loading ? 'Carregando...' : 'Alterar foto'}
        </StyledText>
      </TouchableOpacity>

      <View>
        <StyledText style={styles.name}>{user.name}</StyledText>
        <StyledText style={styles.handle}>@{user.username}</StyledText>
        <StyledText style={styles.since}>
          Ativo desde {formatTimestamp(user.createdAt, { extendedDate: true, includeTime: false })}
        </StyledText>
      </View>
    </View>
  );
}


