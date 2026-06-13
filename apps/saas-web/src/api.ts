import axios from 'axios';

const http = axios.create({ baseURL: '/api' });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => {
    if (res.data?.code !== 0) return Promise.reject(new Error(res.data?.message));
    return res.data.data;
  },
  (err) => Promise.reject(err),
);

export const api = {
  login: (username: string, password: string) =>
    http.post('/auth/admin/login', { username, password }),
  orders: (tenantId: string, status?: string) =>
    http.get('/orders', { params: { tenantId, status } }),
  assign: (orderId: string, riderId: string) =>
    http.post(`/orders/${orderId}/assign`, { riderId }),
  riders: (tenantId: string) => http.get('/riders', { params: { tenantId } }),
  communities: (tenantId: string) =>
    http.get('/communities', { params: { tenantId, all: '1' } }),
};

export default http;
