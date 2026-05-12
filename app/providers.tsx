'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { mantineTheme } from './(customer)/_lib/mantine-theme';
import { ApiSetup } from './_lib/hooks/use-api-setup';
import '@mantine/notifications/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';

// Create QueryClient with better defaults for Next.js 2026
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: data is fresh for 30 seconds
        staleTime: 30 * 1000,
        // Cache time: keep unused data for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests once
        retry: false,
        // Refetch on window focus in development only
        refetchOnWindowFocus: process.env.NODE_ENV === 'development',
        // Don't refetch on reconnect by default (can be overridden per query)
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  });
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="light" theme={mantineTheme}>
        <Notifications position="top-right" />
        <ApiSetup>
          {children}
        </ApiSetup>
      </MantineProvider>
    </QueryClientProvider>
  );
}
