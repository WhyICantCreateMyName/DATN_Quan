import axios from 'axios';

export const NGROK_API = 'https://robert-leafiest-kristen.ngrok-free.dev/api';

const apiClient = axios.create({
  baseURL: NGROK_API,
  headers: {
    'x-platform': 'mobile' // Mobile platform trigger cho API Auth
  }
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;
