import { Router } from "express";
import {
  deleteCustomer,
  deleteManyCustomers,
  getCustomers,
  getCustomerSummary,
} from "./customer.controller.js";

const router = Router();

router.get("/summary", getCustomerSummary);
router.get("/", getCustomers);
router.delete("/", deleteManyCustomers);
router.delete("/:id", deleteCustomer);

export default router;
