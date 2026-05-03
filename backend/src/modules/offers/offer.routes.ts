import { Router } from "express";
import {
  getOffers,
  postOffer,
  putOffer,
  removeOffer,
} from "./offer.controller.js";
import { upload } from "../../middlewares/upload.js";

const router = Router();

router.get("/", getOffers);
router.post("/", upload.single("image"), postOffer);
router.put("/:id", upload.single("image"), putOffer);
router.delete("/:id", removeOffer);

export default router;
