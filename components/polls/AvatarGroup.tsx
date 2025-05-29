// components/polls/AvatarGroup.tsx
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import api from '@/utils/api';
import { User } from '@/types';

interface AvatarGroupProps {
  users: User[];
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ users }) => {
  const MAX_DISPLAY = 5;
  const displayed = users.slice(0, MAX_DISPLAY);
  const remaining = users.length - MAX_DISPLAY;
  return (
    <View style={styles.container}>
      {displayed.map((user, index) => (
        <Image
            key={user.id}
            source={{ 
                uri: user.profilePhoto || 
                `https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png` 
            }}
          style={[styles.avatar, { marginLeft: index === 0 ? 0 : -10 }]}
        />
      ))}
      {remaining > 0 && (
        <View style={[styles.avatar, styles.more]}>
          <Text style={{ color: '#fff', fontSize: 10 }}>+{remaining}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  more: {
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
