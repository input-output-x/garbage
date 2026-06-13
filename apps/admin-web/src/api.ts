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
  tenants: () => http.get('/tenants'),
  createTenant: (data: object) => http.post('/tenants', data),
  updateTenantStatus: (id: string, status: string) =>
    http.patch(`/tenants/${id}/status`, { status }),
  orders: () => http.get('/orders'),
};
