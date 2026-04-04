import {prisma} from "../../lib/prisma.js";
import { CreateStockDTO, UpdateStockDTO } from "../types/stock.dto.js";

export const getAllStocks = async (userId: number) => {
    try {
        const stocks = await prisma.stock.findMany({
            where: {
                product: { userId }
            },
            include: {
                product: true
            }
        });
        return stocks;
    } catch (error) {
        throw error;
    }
}

export const getStockById = async (id: number, userId: number) => {
    try {
        const stock = await prisma.stock.findFirst({
            where: {
                id,
                product: { userId },
            },
            include: {
                product: true
            }
        });
        return stock;
    } catch (error) {
        throw error;
    }
}

export const createStock = async (data: CreateStockDTO, userId: number) => {
    try {
        // Verify the product belongs to the user
        const product = await prisma.product.findFirst({
            where: { id: data.productId, userId }
        });
        if (!product) {
            throw new Error("Product not found or you don't have permission");
        }

        const stock = await prisma.stock.create({
            data,
        });
        return stock;
    } catch (error) {
        throw error;
    }
}

export const updateStock = async (id: number, data: UpdateStockDTO, userId: number) => {
    try {
        // Verify ownership via product
        const existingStock = await prisma.stock.findFirst({
            where: { id, product: { userId } }
        });
        if (!existingStock) {
            throw new Error("Stock not found or you don't have permission to modify it");
        }

        const stock = await prisma.stock.update({
            where: {
                id,
            },
            data,
        });
        return stock;
    } catch (error) {
        throw error;
    }
}

export const deleteStock = async (id: number, userId: number) => {
    try {
        // Verify ownership via product
        const existingStock = await prisma.stock.findFirst({
            where: { id, product: { userId } }
        });
        if (!existingStock) {
            throw new Error("Stock not found or you don't have permission to delete it");
        }

        const stock = await prisma.stock.delete({
            where: {
                id,
            },
        });
        return stock;
    } catch (error) {
        throw error;
    }
}