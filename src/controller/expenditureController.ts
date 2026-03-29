import { Request, Response } from "express";
import * as expenditureService from "../service/expenditureService.js";

export const getAllExpenditures = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;

        const { expenditures, total } = await expenditureService.getAllExpenditures(page, limit, search);
        
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            message: "Expenditures fetched successfully",
            data: expenditures,
            pagination: {
                page,
                limit,
                totalItems: total,
                totalPages,
                hasNextPage: page < totalPages
            }
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getExpenditureById = async (req: Request, res: Response) => {
    try {
        const expenditure = await expenditureService.getExpenditureById(Number(req.params.id));
        if (!expenditure) {
            res.status(404).json({ message: "Expenditure not found" });
            return;
        }
        res.status(200).json({
            message: "Expenditure fetched successfully",
            data: expenditure,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createExpenditure = async (req: Request, res: Response) => {
    try {
        const expenditure = await expenditureService.createExpenditure(req.body);
        res.status(201).json({
            message: "Expenditure created successfully",
            data: expenditure,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateExpenditure = async (req: Request, res: Response) => {
    try {
        const expenditure = await expenditureService.updateExpenditure(Number(req.params.id), req.body);
        res.status(200).json({
            message: "Expenditure updated successfully",
            data: expenditure,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteExpenditure = async (req: Request, res: Response) => {
    try {
        const expenditure = await expenditureService.deleteExpenditure(Number(req.params.id));
        res.status(200).json({
            message: "Expenditure deleted successfully",
            data: expenditure,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
