import { Router } from "express";
import {
  deleteUser,
  getUsers,
  getUsersSummary,
  patchUser,
  patchUserStatus,
  postUser,
} from "./user.controller.js";

const router = Router();

router.get("/summary", getUsersSummary);
router.get("/", getUsers);
router.post("/", postUser);
router.patch("/:id", patchUser);
router.patch("/:id/status", patchUserStatus);
router.delete("/:id", deleteUser);

export default router;
