import { Request, Response } from "express";
import * as reportService from "../service/reportService.js";

export const generateReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, periodType } = req.body;

        // Default to today for DAILY if not provided
        const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
        const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));
        const period = (periodType as any) || "DAILY";

        const savedReport = await reportService.generateReport(start, end, period);

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

export const getReports = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const period = req.query.period as string;
        const search = req.query.search as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const { reports, total } = await reportService.getReports(
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

export const deleteReport = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const deletedReport = await reportService.deleteReport(id);

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
