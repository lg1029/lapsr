import axios from 'axios';
import { getAccessToken } from '../auth/authHelpers';

export const graphClient = axios.create({
  baseURL: 'https://graph.microsoft.com/v1.0',
});

graphClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
