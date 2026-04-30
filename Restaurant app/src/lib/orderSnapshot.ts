import type { OrderHistoryRecord, OrderItem } from "../contexts/OrderContext";
import type {
  ApiOrderStatus,
  PublicOrder,
  PublicOrderItem,
} from "../services/restaurantApi";

const mapStatus = (status?: OrderHistoryRecord["status"]): ApiOrderStatus => {
  switch (status) {
    case "preparing":
      return "PREPARING";
    case "ready":
      return "READY";
    case "paid":
      return "COMPLETED";
    case "placed":
    default:
      return "PENDING";
  }
};

const toPublicOrderItem = (
  item: OrderItem,
  index: number,
): PublicOrderItem => ({
  id: String(item.id ?? index),
  menuItemId: item.menuItemId ?? String(item.id ?? index),
  name: item.name,
  description: item.description ?? "Restaurant menu item",
  imageUrl: item.image ?? null,
  quantity: item.quantity,
  unitPrice: item.price,
  totalPrice: item.price * item.quantity,
  type:
    item.mealType === "Breakfast"
      ? "BREAKFAST"
      : item.mealType === "Dinner"
        ? "DINNER"
        : "LUNCH",
  category: item.category ?? "All",
  subCategory: item.subCategory ?? null,
  diet:
    item.foodType === "Non Veg"
      ? "NON_VEG"
      : item.category === "Beverages"
        ? "BEVERAGE"
        : "VEG",
});

export const buildPublicOrderSnapshot = (
  orderNumber: string,
  history: OrderHistoryRecord | undefined,
  currentItems: OrderItem[],
): PublicOrder | null => {
  if (!orderNumber) return null;

  const sourceItems =
    history?.items.length && history.items.length > 0
      ? history.items
      : currentItems;

  if (!history && sourceItems.length === 0) {
    return null;
  }

  const items = sourceItems.map((item, index) =>
    toPublicOrderItem(item, index),
  );

  const subtotal =
    history?.subtotal ??
    items.reduce((total, item) => total + item.totalPrice, 0);
  const gst = history?.gst ?? Math.round(subtotal * 0.05);
  const totalAmount = history?.totalAmount ?? subtotal + gst;
  const timestamp = history?.updatedAt ?? new Date().toISOString();

  return {
    id: history?.orderNumber ?? orderNumber,
    orderNumber,
    customerName: "Guest",
    tableNumber: history?.tableNumber ?? "12",
    guestCount: 1,
    status: mapStatus(history?.status),
    subtotal,
    gst,
    totalAmount,
    createdAt: history?.createdAt ?? timestamp,
    updatedAt: timestamp,
    items,
    payment: null,
  };
};

export const isTemporaryOrderNumber = (orderNumber?: string) =>
  Boolean(orderNumber && orderNumber.startsWith("TMP-"));

export const formatDisplayOrderNumber = (orderNumber?: string) => {
  if (!orderNumber || isTemporaryOrderNumber(orderNumber)) {
    return "";
  }

  return orderNumber;
};
