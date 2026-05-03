import { Router } from "express";
import {
  getMenuItems,
  postMenuItem,
  putMenuItem,
  removeMenuItem,
} from "./menu-item.controller.js";
import { upload } from "../../middlewares/upload.js";

const router = Router();

router.get("/", getMenuItems);
router.post("/", upload.single("image"), postMenuItem);
router.put("/:id", upload.single("image"), putMenuItem);
router.delete("/:id", removeMenuItem);

export default router;
