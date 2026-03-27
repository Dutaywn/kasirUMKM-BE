import { Router } from "express";
import { generateDailyReport, getReports } from "../controller/reportController.js";

const router = Router();

router.post("/generate-daily", generateDailyReport);
router.get("/", getReports);

export default router;
