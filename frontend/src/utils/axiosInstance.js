import axios from 'axios';

const instance = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`, // ví dụ: https://kiemtra-zg3v.onrender.com/api
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ✅ Gắn token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
