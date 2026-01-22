
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { Sprint, SprintInsights, PRAnalytics, KPI, QueryResponse } from '../types';

export const useSprints = () => {
  return useQuery<Sprint[]>({
    queryKey: ['sprints'],
    queryFn: async () => {
      const { data } = await apiClient.get('/sprints');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSprintInsights = (sprintId?: string) => {
  return useQuery<SprintInsights>({
    queryKey: ['sprints', sprintId, 'insights'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/sprints/${sprintId}/insights`);
      return data;
    },
    enabled: !!sprintId,
    staleTime: 60 * 1000,
  });
};

export const usePRAnalytics = () => {
  return useQuery<PRAnalytics>({
    queryKey: ['code-reviews', 'analytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/code-reviews/analytics');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useKPIs = () => {
  return useQuery<KPI[]>({
    queryKey: ['kpis'],
    queryFn: async () => {
      const { data } = await apiClient.get('/kpis');
      return data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Real-time refresh
  });
};

export const useDevOpsQuery = () => {
  return useMutation<QueryResponse, Error, string>({
    mutationFn: async (query: string) => {
      const { data } = await apiClient.post('/query', { query });
      return data;
    },
  });
};
