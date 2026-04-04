import { Request, Response } from "express";
import * as productService from "../service/productService.js";

import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const getAllProducts = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;

        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { products, total } = await productService.getAllProducts(userId, page, limit, search);
        
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            message: "Products fetched successfully",
            data: products,
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
}

export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const product = await productService.getProductById(Number(req.params.id), userId);
        res.status(200).json({
            message: "Product fetched successfully",
            data: product,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const product = await productService.createProduct(req.body, userId);
        res.status(201).json({
            message: "Product created successfully",
            data: product,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const product = await productService.updateProduct(Number(req.params.id), req.body, userId);
        res.status(200).json({
            message: "Product updated successfully",
            data: product,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const product = await productService.deleteProduct(Number(req.params.id), userId);
        res.status(200).json({
            message: "Product deleted successfully",
            data: product,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}