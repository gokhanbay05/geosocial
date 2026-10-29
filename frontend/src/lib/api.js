import axios from "axios";

const API_URL = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let inMemoryToken = null;

export const getAuthToken = () => inMemoryToken;

export const clearAuthToken = () => {
  inMemoryToken = null;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      response.data.token
    ) {
      inMemoryToken = response.data.token;
      delete response.data.token;
    }
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    const errorResponse = error.response?.data || {
      message: "An unknown error occurred",
    };
    return Promise.reject(errorResponse);
  }
);

export default api;
