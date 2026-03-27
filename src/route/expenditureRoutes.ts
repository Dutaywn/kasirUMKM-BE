import { Router } from "express";
import * as expenditureController from "../controller/expenditureController.js";

const router = Router();

router.get("/", expenditureController.getAllExpenditures);
router.get("/:id", expenditureController.getExpenditureById);
router.post("/", expenditureController.createExpenditure);
router.put("/:id", expenditureController.updateExpenditure);
router.delete("/:id", expenditureController.deleteExpenditure);

export default router;
