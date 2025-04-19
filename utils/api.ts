// src/services/api.ts
import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens } from '@/utils/storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const access  = await getAccessToken();
    const refresh = await getRefreshToken();
    if (access)  config.headers.Authorization    = `Bearer ${access}`;
    if (refresh) config.headers['x-refresh-token'] = refresh;
    return config;
  },
  (err) => Promise.reject(err),
);

api.interceptors.response.use(
  async (res) => {
    const authH    = res.headers['authorization']    as string|undefined;
    const refreshH = res.headers['x-refresh-token']  as string|undefined;

    if (authH?.startsWith('Bearer ')) {
      const newAccess = authH.replace(/^Bearer\s+/, '');
      await setTokens({ accessToken: newAccess, refreshToken: refreshH ?? '' });
    } else if (refreshH) {
      // caso só queira atualizar refresh
      await setTokens({ accessToken: '', refreshToken: refreshH });
    }

    return res;
  },
  (err) => Promise.reject(err),
);

export default api;
