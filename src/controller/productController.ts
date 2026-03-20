import { Request, Response } from "express";
import * as productService from "../service/productService";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();
        res.status(200).json({
            message: "Products fetched successfully",
            data: products,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await productService.getProductById(Number(req.params.id));
        res.status(200).json({
            message: "Product fetched successfully",
            data: product,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json({
            message: "Product created successfully",
            data: product,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await productService.updateProduct(Number(req.params.id), req.body);
        res.status(200).json({
            message: "Product updated successfully",
            data: product,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await productService.deleteProduct(Number(req.params.id));
        res.status(200).json({
            message: "Product deleted successfully",
            data: product,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}