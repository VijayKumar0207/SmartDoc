import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for email sending
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const pdfService = {
  generate: (data) => api.post('/pdf/generate', data),
  download: (id) => `${API_BASE_URL}/pdf/download/${id}`,
  tamper: (id) => api.post(`/pdf/tamper/${id}`, {}, { responseType: 'blob' }),
};

export const verifyService = {
  verify: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/verify/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getLogs: () => api.get('/verify/logs'),
};

export const studentService = {
  list: (branch) => api.get('/students/', { params: { branch } }),
  search: (query) => api.get('/students/search', { params: { query } }),
  create: (data) => api.post('/students/', data),
  delete: (id) => api.delete(`/students/${id}`),
};

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
};

export const docGenerationService = {
  generate: (studentId, docType = 'academic_record') => api.post(`/documents/generate/${studentId}`, null, { params: { doc_type: docType } }),
  verifyPublic: (uuid) => api.get(`/documents/verify-public/${uuid}`),
  share: (documentId, email) => api.post(`/documents/share/${documentId}`, { email }),
};

export default api;
