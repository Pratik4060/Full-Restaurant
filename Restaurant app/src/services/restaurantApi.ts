import { PUBLIC_API_BASE_URL } from "../config/env";

const PUBLIC_API_FALLBACK_URL = "http://localhost:3000/api/v1/public";

export type ApiMealType = "BREAKFAST" | "LUNCH" | "DINNER";
export type ApiDietType = "VEG" | "NON_VEG" | "BEVERAGE";
export type ApiPaymentMethod = "CASH" | "CARD" | "UPI";
export type ApiOrderStatus = "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELED";

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  prepTimeMins: number;
  type: ApiMealType;
  category: string;
  subCategory: string | null;
  diet: ApiDietType;
  isBestseller: boolean;
  likeCount: number;
  isAvailable: boolean;
}

export interface PublicOffer {
  id: string;
  title: string;
  description: string;
  discountText: string;
  imageUrl: string | null;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
}

export interface PublicOrderItem {
  id: string;
  menuItemId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: ApiMealType;
  category: string;
  subCategory: string | null;
  diet: ApiDietType;
}

export interface PublicOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber: string;
  guestCount: number;
  status: ApiOrderStatus;
  subtotal: number;
  gst: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: PublicOrderItem[];
  payment: null | {
    id: string;
    paymentId: string;
    amount: number;
    method: ApiPaymentMethod;
    status: "COMPLETED";
    paidAt: string;
  };
}

export interface PublicOrderDraftItem {
  menuItemId?: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  prepTimeMins?: number;
  type: ApiMealType;
  category: string;
  subCategory?: string;
  diet: ApiDietType;
  isBestseller?: boolean;
}

const requestJson = async <T>(baseUrl: string, path: string, options?: RequestInit) => {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const data = (await response.json().catch(() => ({}))) as T | { message?: string };
  return { response, data };
};

const http = async <T>(path: string, options?: RequestInit) => {
  const firstAttempt = await requestJson<T>(PUBLIC_API_BASE_URL, path, options);

  if (firstAttempt.response.status === 401 && PUBLIC_API_BASE_URL !== PUBLIC_API_FALLBACK_URL) {
    const fallbackAttempt = await requestJson<T>(PUBLIC_API_FALLBACK_URL, path, options);
    if (!fallbackAttempt.response.ok) {
      throw new Error((fallbackAttempt.data as { message?: string }).message ?? "Request failed");
    }
    return fallbackAttempt.data as T;
  }

  if (!firstAttempt.response.ok) {
    throw new Error((firstAttempt.data as { message?: string }).message ?? "Request failed");
  }

  return firstAttempt.data as T;
};

export const restaurantApi = {
  listMenuItems() {
    return http<PublicMenuItem[]>("/menu-items");
  },
  listOffers() {
    return http<PublicOffer[]>("/offers");
  },
  registerCustomer(payload: { customerName: string; customerPhone?: string }) {
    return http<{ id: string; name: string; phone: string | null }>("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  likeMenuItem(payload: Omit<PublicOrderDraftItem, "quantity">) {
    return http<PublicMenuItem>("/menu-items/like", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createOrder(payload: {
    customerName: string;
    customerPhone?: string;
    tableNumber: string;
    guestCount: number;
    items: PublicOrderDraftItem[];
  }) {
    return http<PublicOrder>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getOrder(orderNumber: string) {
    return http<PublicOrder>(`/orders/${orderNumber}`);
  },
  payOrder(orderNumber: string, method: ApiPaymentMethod) {
    return http<PublicOrder>(`/orders/${orderNumber}/pay`, {
      method: "POST",
      body: JSON.stringify({ method }),
    });
  },
};
