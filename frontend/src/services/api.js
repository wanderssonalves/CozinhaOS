import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const filiaisAPI = {
  list: () => http.get('/filiais').then(r => r.data),
  getById: id => http.get(`/filiais/${id}`).then(r => r.data),
  create: data => http.post('/filiais', data).then(r => r.data),
  update: (id, data) => http.put(`/filiais/${id}`, data).then(r => r.data),
  remove: id => http.delete(`/filiais/${id}`).then(r => r.data),
};

export const funcionariosAPI = {
  list: q => http.get('/funcionarios', { params: { q } }).then(r => r.data),
  getById: id => http.get(`/funcionarios/${id}`).then(r => r.data),
  create: data => http.post('/funcionarios', data).then(r => r.data),
  update: (id, data) => http.put(`/funcionarios/${id}`, data).then(r => r.data),
  remove: id => http.delete(`/funcionarios/${id}`).then(r => r.data),
};

export const transacoesAPI = {
  list: q => http.get('/transacoes', { params: { q } }).then(r => r.data),
  getById: id => http.get(`/transacoes/${id}`).then(r => r.data),
  create: data => http.post('/transacoes', data).then(r => r.data),
  remove: id => http.delete(`/transacoes/${id}`).then(r => r.data),
};

export const producaoAPI = {
  list: q => http.get('/producao', { params: { q } }).then(r => r.data),
  getById: id => http.get(`/producao/${id}`).then(r => r.data),
  create: data => http.post('/producao', data).then(r => r.data),
  remove: id => http.delete(`/producao/${id}`).then(r => r.data),
};

export const dashboardAPI = {
  stats: () => http.get('/dashboard/stats').then(r => r.data),
};
