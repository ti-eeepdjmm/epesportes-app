// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setUserRegistered = async () => {
  await AsyncStorage.setItem('userRegistered', 'true');
};

export const isUserRegistered = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem('userRegistered');
  return value === 'true';
};
