import { Router } from "express";
import { getOrders, patchOrderStatus, postOrder } from "./order.controller.js";

const router = Router();

router.get("/", getOrders);
router.post("/", postOrder);
router.patch("/:id/status", patchOrderStatus);

export default router;
