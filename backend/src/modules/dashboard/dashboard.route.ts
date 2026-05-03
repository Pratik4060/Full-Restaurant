import { Router } from "express";
import { activeOffers, orderStatus, overview, popularItems, revenue, summary } from "./dashboard.controller.js";

const router = Router();

router.get("/summary", summary);
router.get("/overview", overview);
router.get("/revenue", revenue);
router.get("/order-status", orderStatus);
router.get("/active-offers", activeOffers);
router.get("/popular-items", popularItems);

export default router;
