"use client";

import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useState } from "react";

const emotionCache = createCache({
  key: "mantine",
  prepend: true, // VERY IMPORTANT for Next.js
});

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <CacheProvider value={emotionCache}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider defaultColorScheme="light">
          {children}
        </MantineProvider>
      </QueryClientProvider>
    </CacheProvider>
  );
}
