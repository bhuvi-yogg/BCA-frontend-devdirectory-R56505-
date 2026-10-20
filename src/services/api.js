import axios from 'axios';

// Single configured client for the assignment API (JSONPlaceholder is a demo API:
// POST requests return 201 but nothing is actually stored).
const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Second client for the optional AI proxy (server/index.js). Holds no secrets.
export const aiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_PROXY_URL || '/api',
  timeout: 30000,
});

const friendly = (err) => {
  if (err.response) err.message = err.response.status === 404 ? 'Not found (404).' : `Server error (${err.response.status}).`;
  else if (err.code === 'ECONNABORTED') err.message = 'The request timed out.';
  else err.message = 'Network error. Check your connection.';
  return Promise.reject(err);
};
apiClient.interceptors.response.use((r) => r, friendly);
aiClient.interceptors.response.use((r) => r, (err) => {
  err.message = err.response?.data?.error || (err.response ? `AI proxy error (${err.response.status})` : 'AI proxy is not reachable.');
  return Promise.reject(err);
});

export default apiClient;
