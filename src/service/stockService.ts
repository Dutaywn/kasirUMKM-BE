import {prisma} from "../../lib/prisma.js";
import { CreateStockDTO, UpdateStockDTO } from "../types/stock.dto.js";

export const getAllStocks = async () => {
    try {
        const stocks = await prisma.stock.findMany({
            include: {
                product: true
            }
        });
        return stocks;
    } catch (error) {
        throw error;
    }
}

export const getStockById = async (id: number) => {
    try {
        const stock = await prisma.stock.findUnique({
            where: {
                id,
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

export const createStock = async (data: CreateStockDTO) => {
    try {
        const stock = await prisma.stock.create({
            data,
        });
        return stock;
    } catch (error) {
        throw error;
    }
}

export const updateStock = async (id: number, data: UpdateStockDTO) => {
    try {
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

export const deleteStock = async (id: number) => {
    try {
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