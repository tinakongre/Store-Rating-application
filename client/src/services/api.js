import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',   // backend server
});

export default api;
