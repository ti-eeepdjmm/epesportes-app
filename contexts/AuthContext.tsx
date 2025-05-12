// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types'
import { AppLoader } from '@/components/AppLoader';



interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext({} as AuthContextData);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const loadStorage = async () => {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }

      setIsLoading(false);
    };

    loadStorage();
  }, []);

  const signIn = async (receivedToken: string, receivedUser: User) => {
    setToken(receivedToken);
    setUser(receivedUser);

    await SecureStore.setItemAsync('token', receivedToken);
    await SecureStore.setItemAsync('user', JSON.stringify(receivedUser));
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);

    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
  };

  const updateUser = async (newUser: User) => {
    setUser(newUser);
    await SecureStore.setItemAsync('user', JSON.stringify(newUser));
  };

  if (isLoading) return <AppLoader visible />;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};