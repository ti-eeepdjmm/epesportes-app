// src/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Cria uma instância do Axios com a base da API
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, // ou sua URL da API
  timeout: 10000,
});

// Interceptor: adiciona token em todas as requisições automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
