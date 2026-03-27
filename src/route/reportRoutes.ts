import { Router } from "express";
import { generateDailyReport, getReports, deleteReport } from "../controller/reportController.js";

const router = Router();

router.post("/generate-daily", generateDailyReport);
router.get("/", getReports);
router.delete("/:id", deleteReport);

export default router;
