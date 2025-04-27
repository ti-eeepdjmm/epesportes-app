import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { StyledText } from '@/components/StyledText';
import { useTheme } from '@/hooks/useTheme';
import { User } from '@/types';
import { formatTimestamp } from '@/utils/date';

export default function ProfileInfoCard({ user, onEditPhoto }: { user: User, onEditPhoto: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles(theme).container}>
      <TouchableOpacity onPress={onEditPhoto} style={styles(theme).container_avatar}>
        <Image 
            source={{ uri: user?.profilePhoto || 'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png' }}
            style={styles(theme).avatar} 
        />
        <StyledText style={styles(theme).link}>Alterar foto</StyledText>
      </TouchableOpacity>
      <View>
        <StyledText style={styles(theme).name}>{user.name}</StyledText>
        <StyledText style={styles(theme).handle}>@{user.username}</StyledText>
        <StyledText style={styles(theme).since}>Ativo desde {formatTimestamp(user.createdAt, { extendedDate: true, includeTime: false })}</StyledText>
      </View>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  container_avatar:{alignItems: 'center', justifyContent: 'center'},
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: theme.greenLight },
  name: { fontSize: 18, fontWeight: 'bold', color: theme.black },
  handle: { fontSize: 14, color: theme.gray },
  since: { fontSize: 12, color: theme.gray },
  link: { color: theme.greenLight, marginTop: 4, fontSize: 14 },
});