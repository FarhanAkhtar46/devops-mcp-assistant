import axios from 'axios';

// In a real app, this would come from process.env.VITE_API_BASE_URL
const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

// Call DevOps Insight API
export async function fetchDevOpsInsight(prompts: string[]): Promise<any> {
  const response = await apiClient.post('/devops-insight', { prompts });
  return response.data;
}

// Fetch dashboard landing data
export async function fetchDashboard(): Promise<any> {
  const response = await apiClient.get('/dashboard');
  return response.data;
}
