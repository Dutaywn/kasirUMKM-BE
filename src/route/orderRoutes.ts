import { Router } from "express";
import * as orderController from "../controller/orderController";

const router = Router();

router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);

export default router;
