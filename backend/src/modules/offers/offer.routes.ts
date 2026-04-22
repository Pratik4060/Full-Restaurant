import { Router } from "express";
import { getOffers, postOffer, putOffer, removeOffer } from "./offer.controller.js";

const router = Router();

router.get("/", getOffers);
router.post("/", postOffer);
router.put("/:id", putOffer);
router.delete("/:id", removeOffer);

export default router;
