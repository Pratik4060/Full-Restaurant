import { Router } from "express";
import { getMenuItems, postMenuItem, putMenuItem, removeMenuItem } from "./menu-item.controller.js";

const router = Router();

router.get("/", getMenuItems);
router.post("/", postMenuItem);
router.put("/:id", putMenuItem);
router.delete("/:id", removeMenuItem);

export default router;
