// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';


const USER_REGISTERED_KEY = 'userRegistered';
const ACCESS_TOKEN_KEY  = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export async function setUserRegistered(value: boolean) {
  await AsyncStorage.setItem(USER_REGISTERED_KEY, value.toString());
}

export async function isUserRegistered(): Promise<boolean> {
  const value = await AsyncStorage.getItem(USER_REGISTERED_KEY);
  return value === 'true';
}

export async function setTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
