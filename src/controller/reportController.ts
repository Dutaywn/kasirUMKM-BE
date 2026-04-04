import { Request, Response } from "express";
import * as reportService from "../service/reportService.js";

import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const generateReport = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { startDate, endDate, periodType } = req.body;

        const period = (periodType || "DAILY") as "DAILY" | "WEEKLY" | "MONTHLY";

        let start: Date;
        let end: Date;

        const baseDate = startDate ? new Date(startDate) : new Date();

        if (isNaN(baseDate.getTime())) {
            return res.status(400).json({ message: "Invalid startDate" });
        }

        // 🔥 NORMALIZATION (INI YANG PENTING)
        if (period === "DAILY") {
            start = new Date(baseDate);
            start.setHours(0, 0, 0, 0);

            end = new Date(start);
            end.setDate(start.getDate() + 1); // 🔥 next day
        }

        else if (period === "WEEKLY") {
            const day = baseDate.getDay();
            const diffToMonday = (day === 0 ? -6 : 1 - day);

            start = new Date(baseDate);
            start.setDate(baseDate.getDate() + diffToMonday);
            start.setHours(0, 0, 0, 0);

            end = new Date(start);
            end.setDate(start.getDate() + 7); // 🔥 next week
        }

        else { // MONTHLY
            start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
            start.setHours(0, 0, 0, 0);

            end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1); // 🔥 next month
        }

        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const savedReport = await reportService.generateReport(start, end, period, userId);

        res.status(200).json({
            message: `Laporan ${period.toLowerCase()} berhasil di-generate dan disimpan.`,
            data: savedReport,
        });

    } catch (error: any) {
        console.error("Error generating report:", error);
        res.status(500).json({
            message: error.message || "Gagal men-generate laporan."
        });
    }
};

export const getReports = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const period = req.query.period as string;
        const search = req.query.search as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { reports, total } = await reportService.getReports(
            userId,
            page,
            limit,
            period,
            search,
            startDate,
            endDate
        );

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            message: "Reports fetched successfully",
            data: reports,
            pagination: {
                page,
                limit,
                totalItems: total,
                totalPages,
                hasNextPage: page < totalPages
            }
        });
    } catch (error: any) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ 
            message: error.message || "Gagal mengambil data laporan." 
        });
    }
};

export const deleteReport = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const deletedReport = await reportService.deleteReport(id, userId);

        res.status(200).json({
            message: "Laporan berhasil dihapus.",
            data: deletedReport,
        });
    } catch (error: any) {
        console.error("Error deleting report:", error);
        res.status(500).json({ 
            message: error.message || "Gagal menghapus laporan. Pastikan ID valid." 
        });
    }
};
