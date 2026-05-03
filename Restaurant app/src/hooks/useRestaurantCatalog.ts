import { useCallback, useEffect, useState } from "react";
import { restaurantApi, type PublicMenuItem, type PublicOffer } from "../services/restaurantApi";
import { useRealtimeInvalidate } from "./useRealtimeInvalidate";

export function useRestaurantCatalog() {
  const [menuItems, setMenuItems] = useState<PublicMenuItem[]>([]);
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [nextMenuItems, nextOffers] = await Promise.all([
        restaurantApi.listMenuItems(),
        restaurantApi.listOffers(),
      ]);

      setMenuItems(nextMenuItems);
      setOffers(nextOffers);
    } catch {
      setMenuItems([]);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useRealtimeInvalidate(["menu-items", "offers"], () => {
    void load();
  });

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      try {
        const [nextMenuItems, nextOffers] = await Promise.all([
          restaurantApi.listMenuItems(),
          restaurantApi.listOffers(),
        ]);

        if (!cancelled) {
          setMenuItems(nextMenuItems);
          setOffers(nextOffers);
        }
      } catch {
        if (!cancelled) {
          setMenuItems([]);
          setOffers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCatalog();
    const refreshTimer = window.setInterval(() => {
      void loadCatalog();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
    };
  }, []);

  return { menuItems, offers, loading };
}
