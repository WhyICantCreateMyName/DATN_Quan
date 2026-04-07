import axios from 'axios';

// Thay đổi ngrok url ở đây để áp dụng toàn cục
export const NGROK_API = 'https://robert-leafiest-kristen.ngrok-free.dev/api';

const apiClient = axios.create({
  baseURL: NGROK_API,
  headers: {
    'x-platform': 'mobile'
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
