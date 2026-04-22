import { Router } from "express";
import {
  getBillingCards,
  getPendingPayments,
  getRecentPayments,
  postPayment,
  removePayment,
  removePendingOrder,
} from "./billing.controller.js";

const router = Router();

router.get("/summary", getBillingCards);
router.get("/pending-payments", getPendingPayments);
router.get("/recent-payments", getRecentPayments);
router.post("/payments", postPayment);
router.delete("/orders/:id", removePendingOrder);
router.delete("/payments/:id", removePayment);

export default router;
