import { Request, Response } from "express";
import * as stockService from "../service/stockService.js";

export const getAllStocks = async (req: Request, res: Response) => {
    try {
        const stocks = await stockService.getAllStocks();
        res.status(200).json({
            message: "Stocks fetched successfully",
            data: stocks,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const getStockById = async (req: Request, res: Response) => {
    try {
        const stock = await stockService.getStockById(Number(req.params.id));
        res.status(200).json({
            message: "Stock fetched successfully",
            data: stock,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const createStock = async (req: Request, res: Response) => {
    try {
        const stock = await stockService.createStock(req.body);
        res.status(201).json({
            message: "Stock created successfully",
            data: stock,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const updateStock = async (req: Request, res: Response) => {
    try {
        const stock = await stockService.updateStock(Number(req.params.id), req.body);
        res.status(200).json({
            message: "Stock updated successfully",
            data: stock,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const deleteStock = async (req: Request, res: Response) => {
    try {
        const stock = await stockService.deleteStock(Number(req.params.id));
        res.status(200).json({
            message: "Stock deleted successfully",
            data: stock,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}