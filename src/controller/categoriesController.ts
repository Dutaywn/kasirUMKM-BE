import { Request, Response } from "express";
import * as categoryService from "../service/categoriesService.js";

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json({
            message: "Categories fetched successfully",
            data: categories,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const category = await categoryService.getCategoryById(Number(req.params.id));
        res.status(200).json({
            message: "Category fetched successfully",
            data: category,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const createCategory = async (req: Request, res: Response) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json({
            message: "Category created successfully",
            data: category,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const category = await categoryService.updateCategory(Number(req.params.id), req.body);
        res.status(200).json({
            message: "Category updated successfully",
            data: category,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const category = await categoryService.deleteCategory(Number(req.params.id));
        res.status(200).json({
            message: "Category deleted successfully",
            data: category,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}