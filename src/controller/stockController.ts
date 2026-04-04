import { Request, Response } from "express";
import * as stockService from "../service/stockService.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const getAllStocks = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const stocks = await stockService.getAllStocks(userId);
        res.status(200).json({
            message: "Stocks fetched successfully",
            data: stocks,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const getStockById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const stock = await stockService.getStockById(Number(req.params.id), userId);
        res.status(200).json({
            message: "Stock fetched successfully",
            data: stock,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const createStock = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const stock = await stockService.createStock(req.body, userId);
        res.status(201).json({
            message: "Stock created successfully",
            data: stock,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const updateStock = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const stock = await stockService.updateStock(Number(req.params.id), req.body, userId);
        res.status(200).json({
            message: "Stock updated successfully",
            data: stock,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const deleteStock = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const stock = await stockService.deleteStock(Number(req.params.id), userId);
        res.status(200).json({
            message: "Stock deleted successfully",
            data: stock,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}