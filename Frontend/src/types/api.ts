export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELED";
export type DietType = "VEG" | "NON_VEG" | "BEVERAGE";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";
export type RevenuePeriod = "weekly" | "monthly" | "yearly";
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "WALLET";
export type PaymentStatus = "PENDING" | "COMPLETED";
export type UserRole = "ADMIN" | "MANAGER" | "KITCHEN" | "CASHIER" | "WAITER";

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  prepTimeMins: number;
  type: MealType;
  category: string;
  subCategory: string | null;
  diet: DietType;
  isBestseller: boolean;
  likeCount: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  menuItem: MenuItem;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber: string;
  guestCount: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountText: string;
  imageUrl: string | null;
  isActive: boolean;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  todaysOrders: number;
  todaysRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
}

export interface RevenueResponse {
  period: RevenuePeriod;
  points: RevenuePoint[];
}

export interface OrderStatusPoint {
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED";
  count: number;
}

export interface PopularItemPoint {
  menuItemId: string;
  name: string;
  diet: DietType;
  likes: number;
}

export interface PopularItemsResponse {
  veg: PopularItemPoint[];
  nonVeg: PopularItemPoint[];
  beverages: PopularItemPoint[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerSummaryCards {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface CustomerTableRow {
  id: string;
  customerName: string;
  contactNumber: string | null;
  numberOfGuest: number;
  tableNumber: string | null;
  numberOfOrders: number;
  totalSpent: number;
  lastVisit: string | null;
}

export interface CustomerSummaryResponse {
  period: RevenuePeriod;
  cards: CustomerSummaryCards;
}

export interface CustomerTableResponse {
  period: RevenuePeriod;
  pagination: PaginationMeta;
  rows: CustomerTableRow[];
}

export interface BillingSummaryCards {
  todaysRevenue: number;
  unpaidBills: number;
  paidToday: number;
  totalPayments: number;
}

export interface BillingSummaryResponse {
  period: RevenuePeriod;
  cards: BillingSummaryCards;
}

export interface PendingPaymentRow {
  id: string;
  order: string;
  customer: string;
  table: string;
  items: number;
  amount: number;
  status: OrderStatus;
}

export interface RecentPaymentRow {
  id: string;
  paymentId: string;
  order: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  status: PaymentStatus;
}

export interface PendingPaymentsResponse {
  period: RevenuePeriod;
  pagination: PaginationMeta;
  rows: PendingPaymentRow[];
}

export interface RecentPaymentsResponse {
  period: RevenuePeriod;
  pagination: PaginationMeta;
  rows: RecentPaymentRow[];
}

export interface ProcessedPayment {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
}

export interface UserSummaryCards {
  admin: number;
  manager: number;
  kitchen: number;
  cashier: number;
  waiter: number;
}

export interface UserSummaryResponse {
  cards: UserSummaryCards;
}

export interface UserRow {
  id: string;
  user: string;
  email: string;
  role: UserRole;
  created: string;
  status: boolean;
}

export interface UsersTableResponse {
  pagination: PaginationMeta;
  rows: UserRow[];
}
