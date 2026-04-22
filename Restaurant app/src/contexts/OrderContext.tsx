import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { restaurantApi } from "../services/restaurantApi";

export interface OrderItem {
  id: string | number;
  menuItemId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  mealType?: "Breakfast" | "Lunch" | "Dinner";
  foodType?: "Veg" | "Non Veg";
  isBestseller?: boolean;
}

export type OrderStatus = "placed" | "preparing" | "ready" | "paid";

export interface OrderHistoryRecord {
  orderNumber: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

interface OrderContextType {
  orderItems: OrderItem[];
  orderPlaced: boolean;
  orderNumber: string;
  orderHistory: OrderHistoryRecord[];
  addToOrder: (item: OrderItem) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  removeItem: (id: string | number) => void;
  clearOrder: () => void;
  placeOrder: (meta?: { tableNumber?: string }) => Promise<string>;
  resetPlacedOrder: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getItemQuantity: (id: string | number) => number;
  updateOrderStatus: (orderNumber: string, status: OrderStatus) => void;
  markOrderPaid: (orderNumber: string) => void;
  getOrderByNumber: (orderNumber: string) => OrderHistoryRecord | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);
const ORDER_HISTORY_KEY = "restaurant-order-history";
const CURRENT_ORDER_KEY = "restaurant-current-order-number";
const ORDER_PLACED_KEY = "restaurant-order-placed";
const USER_DATA_KEY = "restaurant-user-data";

const normalizeHistory = (records: OrderHistoryRecord[]): OrderHistoryRecord[] => {
  const latestByOrder = new Map<string, OrderHistoryRecord>();

  for (const record of records) {
    const existing = latestByOrder.get(record.orderNumber);
    if (!existing) {
      latestByOrder.set(record.orderNumber, record);
      continue;
    }

    const existingTime = new Date(existing.updatedAt).getTime();
    const recordTime = new Date(record.updatedAt).getTime();

    if (recordTime >= existingTime) {
      latestByOrder.set(record.orderNumber, record);
    }
  }

  return [...latestByOrder.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
};

const loadHistory = (): OrderHistoryRecord[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ORDER_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as OrderHistoryRecord[];
    return Array.isArray(parsed) ? normalizeHistory(parsed) : [];
  } catch {
    return [];
  }
};

const getOrderTotals = (items: OrderItem[]) => {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  return {
    subtotal,
    gst,
    totalAmount: subtotal + gst,
  };
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(ORDER_PLACED_KEY) === "true";
  });
  const [orderNumber, setOrderNumber] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(CURRENT_ORDER_KEY) ?? "";
  });
  const [orderHistory, setOrderHistory] = useState<OrderHistoryRecord[]>(loadHistory);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      ORDER_HISTORY_KEY,
      JSON.stringify(normalizeHistory(orderHistory)),
    );
  }, [orderHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(CURRENT_ORDER_KEY, orderNumber);
    window.localStorage.setItem(ORDER_PLACED_KEY, String(orderPlaced));
  }, [orderNumber, orderPlaced]);

  const addToOrder = (item: OrderItem) => {
    setOrderItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, { ...item, quantity: item.quantity }];
    });
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const removeItem = (id: string | number) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearOrder = () => setOrderItems([]);

  const placeOrder = async (meta?: { tableNumber?: string }) => {
    if (orderPlaced && orderNumber) {
      return orderNumber;
    }

    const rawUserData =
      typeof window === "undefined" ? null : window.localStorage.getItem(USER_DATA_KEY);
    const parsedUserData = rawUserData
      ? (JSON.parse(rawUserData) as {
          name?: string;
          mobile?: string;
          guests?: string;
          table?: string;
        })
      : null;

    const itemsSnapshot = orderItems.map((item) => ({ ...item }));
    const response = await restaurantApi.createOrder({
      customerName: parsedUserData?.name ?? "Guest",
      customerPhone: parsedUserData?.mobile ?? undefined,
      tableNumber: meta?.tableNumber ?? parsedUserData?.table ?? "12",
      guestCount: Number(parsedUserData?.guests ?? 1),
      items: itemsSnapshot.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        description: item.description ?? "Restaurant menu item",
        imageUrl: item.image || undefined,
        price: item.price,
        quantity: item.quantity,
        type:
          item.mealType === "Breakfast"
            ? "BREAKFAST"
            : item.mealType === "Dinner"
              ? "DINNER"
              : "LUNCH",
        category: item.category ?? "All",
        subCategory: item.subCategory,
        diet:
          item.foodType === "Non Veg"
            ? "NON_VEG"
            : item.category === "Beverages"
              ? "BEVERAGE"
              : "VEG",
        isBestseller: item.isBestseller,
      })),
    });

    const now = new Date().toISOString();

    setOrderNumber(response.orderNumber);
    setOrderPlaced(true);
    setOrderHistory((prev) =>
      normalizeHistory([
        {
          orderNumber: response.orderNumber,
          tableNumber: response.tableNumber,
          items: itemsSnapshot,
          subtotal: response.subtotal,
          gst: response.gst,
          totalAmount: response.totalAmount,
          status: "placed",
          createdAt: now,
          updatedAt: now,
        },
        ...prev,
      ]),
    );

    return response.orderNumber;
  };

  const resetPlacedOrder = () => {
    setOrderPlaced(false);
    setOrderNumber("");
  };

  const updateOrderStatus = (targetOrderNumber: string, status: OrderStatus) => {
    if (!targetOrderNumber) return;

    const now = new Date().toISOString();

    setOrderHistory((prev) =>
      normalizeHistory(
        prev.map((entry) =>
          entry.orderNumber === targetOrderNumber
            ? { ...entry, status, updatedAt: now }
            : entry,
        ),
      ),
    );
  };

  const markOrderPaid = (targetOrderNumber: string) => {
    if (!targetOrderNumber) return;

    const snapshot = orderItems.map((item) => ({ ...item }));
    const { subtotal, gst, totalAmount } = getOrderTotals(snapshot);
    const now = new Date().toISOString();
    let recordFound = false;

    setOrderHistory((prev) =>
      normalizeHistory(
        prev.map((entry) => {
          if (entry.orderNumber !== targetOrderNumber) return entry;

          recordFound = true;
          return {
            ...entry,
            items: entry.items.length > 0 ? entry.items : snapshot,
            subtotal: entry.subtotal || subtotal,
            gst: entry.gst || gst,
            totalAmount: entry.totalAmount || totalAmount,
            status: "paid",
            updatedAt: now,
          };
        }),
      ),
    );

    if (!recordFound && targetOrderNumber) {
      setOrderHistory((prev) => [
        {
          orderNumber: targetOrderNumber,
          tableNumber: "12",
          items: snapshot,
          subtotal,
          gst,
          totalAmount,
          status: "paid",
          createdAt: now,
          updatedAt: now,
        },
        ...prev,
      ]);
    }
  };

  const getOrderByNumber = (targetOrderNumber: string) =>
    orderHistory.find((entry) => entry.orderNumber === targetOrderNumber);

  const getTotalPrice = () =>
    orderItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const getTotalItems = () =>
    orderItems.reduce((total, item) => total + item.quantity, 0);

  const getItemQuantity = (id: string | number) => {
    const item = orderItems.find((i) => i.id === id);
    return item?.quantity || 0;
  };

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        orderPlaced,
        orderNumber,
        orderHistory,
        addToOrder,
        updateQuantity,
        removeItem,
        clearOrder,
        placeOrder,
        resetPlacedOrder,
        getTotalPrice,
        getTotalItems,
        getItemQuantity,
        updateOrderStatus,
        markOrderPaid,
        getOrderByNumber,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }
  return context;
};
