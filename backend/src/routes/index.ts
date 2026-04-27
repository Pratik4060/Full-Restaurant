import { Router } from "express";
import authRoutes from "../modules/auth/auth.route.js";
import dashboardRoutes from "../modules/dashboard/dashboard.route.js";
import orderRoutes from "../modules/orders/order.route.js";
import menuItemRoutes from "../modules/menu-items/menu-item.route.js";
import offerRoutes from "../modules/offers/offer.routes.js";
import customerRoutes from "../modules/customers/customer.route.js";
import billingRoutes from "../modules/billing/billing.route.js";
import userRoutes from "../modules/users/user.route.js";
import publicRoutes from "../modules/public/public.route.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { streamRealtimeEvents } from "../realtime/events.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/events", streamRealtimeEvents);
router.use("/auth", authRoutes);
router.use("/public", publicRoutes);

router.use(authMiddleware);
router.use("/dashboard", dashboardRoutes);
router.use("/orders", orderRoutes);
router.use("/menu-items", menuItemRoutes);
router.use("/offers", offerRoutes);
router.use("/customers", customerRoutes);
router.use("/billing", billingRoutes);
router.use("/users", userRoutes);

export default router;
