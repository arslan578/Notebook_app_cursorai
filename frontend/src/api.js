import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Create base API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post("/api/token/", credentials),
  register: (userData) => api.post("/api/user/", userData),
  refresh: (refresh_token) => api.post("/api/token/refresh/", { refresh: refresh_token }),
  logout: (data) => api.post("/api/user/logout/", data),
};

export const notesAPI = {
  getAll: () => api.get("/api/notes/"),
  create: (noteData) => api.post("/api/notes/", noteData),
  delete: (id) => api.delete(`/api/notes/${id}/`),
  update: (id, noteData) => api.put(`/api/notes/${id}/`, noteData),
};


export default api;