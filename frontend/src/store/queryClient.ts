import { QueryClient } from '@tanstack/react-query';

// Feature #19: Performance Features - Optimized query client with caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes - cache data for better performance
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache (formerly cacheTime)
    },
    mutations: {
      // Optimistic updates for better UX
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries();
      },
    },
  },
});

