"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => undefined;

/**
 * Hydration-safe "are we on the client?" flag without setState-in-effect.
 * Renders false during SSR/hydration, true afterwards on the client.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
