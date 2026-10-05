"use client";

import { useState, type ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuthKit } from "@convex-dev/workos";
import { AuthKitProvider, useAccessToken, useAuth } from "@workos-inc/authkit-nextjs/components";

function useAuthFromAuthKit() {
  const { user, loading } = useAuth();
  const { getAccessToken } = useAccessToken();

  return {
    isLoading: loading,
    user,
    getAccessToken: async (): Promise<string | null> => {
      try {
        return (await getAccessToken()) ?? null;
      } catch {
        return null;
      }
    },
  };
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [convex] = useState(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!));

  return (
    <AuthKitProvider>
      <ConvexProviderWithAuthKit client={convex} useAuth={useAuthFromAuthKit}>
        {children}
      </ConvexProviderWithAuthKit>
    </AuthKitProvider>
  );
}
