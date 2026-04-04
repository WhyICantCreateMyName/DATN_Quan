import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor ném error sạch sẽ
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    throw error.response?.data || error.message;
  }
);

export default axiosClient;
