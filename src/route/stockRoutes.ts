import {Router} from "express";
import * as stockController from "../controller/stockController.js";

const router = Router();

router.get("/", stockController.getAllStocks);
router.get("/:id", stockController.getStockById);
router.post("/", stockController.createStock);
router.put("/:id", stockController.updateStock);
router.delete("/:id", stockController.deleteStock);

export default router;