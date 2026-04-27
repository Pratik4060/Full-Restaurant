import { Router } from "express";
import {
  getPublicEvents,
  postPublicCustomer,
  getPublicMenu,
  getPublicOffers,
  getPublicOrderByNumber,
  postPublicLike,
  postPublicOrder,
  postPublicPayment,
} from "./public.controller.js";

const router = Router();

router.get("/events", getPublicEvents);
router.get("/menu-items", getPublicMenu);
router.get("/offers", getPublicOffers);
router.post("/customers", postPublicCustomer);
router.post("/menu-items/like", postPublicLike);
router.post("/orders", postPublicOrder);
router.get("/orders/:orderNumber", getPublicOrderByNumber);
router.post("/orders/:orderNumber/pay", postPublicPayment);

export default router;
