import { useEffect, useState } from "react";
import { restaurantApi, type PublicMenuItem, type PublicOffer } from "../services/restaurantApi";

export function useRestaurantCatalog() {
  const [menuItems, setMenuItems] = useState<PublicMenuItem[]>([]);
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
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

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { menuItems, offers, loading };
}
