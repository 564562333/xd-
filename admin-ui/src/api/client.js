import axios from 'axios';
import md5 from 'md5';

const apiClient = axios.create({
  baseURL: '/api',
});

const HASHED_PASSWORD_REGEX = /^[a-f0-9]{32}$/i;

const hashPasswordValue = (value) => {
  if (typeof value !== 'string' || HASHED_PASSWORD_REGEX.test(value)) {
    return value;
  }
  return md5(value);
};

const mutatePasswordFields = (payload) => {
  if (!payload) {
    return;
  }

  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    payload.forEach((value, key) => {
      if (typeof value === 'string' && key.toLowerCase().includes('password')) {
        const hashed = hashPasswordValue(value);
        if (hashed !== value) {
          payload.set(key, hashed);
        }
      }
    });
    return;
  }

  if (typeof URLSearchParams !== 'undefined' && payload instanceof URLSearchParams) {
    Array.from(payload.keys()).forEach((key) => {
      const value = payload.get(key);
      if (typeof value === 'string' && key.toLowerCase().includes('password')) {
        const hashed = hashPasswordValue(value);
        if (hashed !== value) {
          payload.set(key, hashed);
        }
      }
    });
    return;
  }

  if (Array.isArray(payload)) {
    payload.forEach((item) => mutatePasswordFields(item));
    return;
  }

  if (typeof payload === 'object') {
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (key.toLowerCase().includes('password')) {
        payload[key] = hashPasswordValue(value);
        return;
      }
      mutatePasswordFields(value);
    });
  }
};

apiClient.interceptors.request.use(
  (config) => {
    mutatePasswordFields(config.data);
    mutatePasswordFields(config.params);

    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
