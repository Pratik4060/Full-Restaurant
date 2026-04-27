import { useEffect, useRef } from "react";
import { PUBLIC_API_BASE_URL } from "../config/env";

type RealtimeEntity =
  | "menu-items"
  | "offers"
  | "orders"
  | "customers"
  | "billing"
  | "dashboard";

export function useRealtimeInvalidate(
  entities: RealtimeEntity[],
  onInvalidate: () => void
) {
  const callbackRef = useRef(onInvalidate);
  const entitiesRef = useRef(new Set(entities));

  useEffect(() => {
    callbackRef.current = onInvalidate;
    entitiesRef.current = new Set(entities);
  }, [entities, onInvalidate]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;

    let flushTimer: number | null = null;
    const eventSource = new EventSource(`${PUBLIC_API_BASE_URL}/events`);

    const queueRefresh = () => {
      if (flushTimer !== null) return;
      flushTimer = window.setTimeout(() => {
        flushTimer = null;
        callbackRef.current();
      }, 250);
    };

    const handleInvalidate = (event: Event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as { entities?: RealtimeEntity[] };
      const hasMatch = (payload.entities ?? []).some((entity) => entitiesRef.current.has(entity));
      if (hasMatch) {
        queueRefresh();
      }
    };

    eventSource.addEventListener("invalidate", handleInvalidate);

    return () => {
      eventSource.removeEventListener("invalidate", handleInvalidate);
      eventSource.close();
      if (flushTimer !== null) {
        window.clearTimeout(flushTimer);
      }
    };
  }, []);
}
