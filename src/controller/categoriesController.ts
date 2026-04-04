import { Request, Response } from "express";
import * as categoryService from "../service/categoriesService.js";

import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const getAllCategories = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const categories = await categoryService.getAllCategories(userId);
        res.status(200).json({
            message: "Categories fetched successfully",
            data: categories,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const getCategoryById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const category = await categoryService.getCategoryById(Number(req.params.id), userId);
        res.status(200).json({
            message: "Category fetched successfully",
            data: category,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const category = await categoryService.createCategory(req.body, userId);
        res.status(201).json({
            message: "Category created successfully",
            data: category,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const updateCategory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const category = await categoryService.updateCategory(Number(req.params.id), req.body, userId);
        res.status(200).json({
            message: "Category updated successfully",
            data: category,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const deleteCategory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const category = await categoryService.deleteCategory(Number(req.params.id), userId);
        res.status(200).json({
            message: "Category deleted successfully",
            data: category,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}