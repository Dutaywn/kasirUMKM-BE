import { Router } from "express";
import { generateReport, getReports, deleteReport } from "../controller/reportController.js";

const router = Router();

router.post("/generate", generateReport);
router.get("/", getReports);
router.delete("/:id", deleteReport);

export default router;
