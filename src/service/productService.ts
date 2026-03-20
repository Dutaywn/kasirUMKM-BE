import { prisma } from "../../lib/prisma";
import { CreateProductDTO, UpdateProductDTO } from "../types/product.dto";


export const getAllProducts = async () => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: {
                    select: {
                        name: true,
                    }
                },
                stocks: {
                    select: {
                        id: true,
                        total: true,
                    }
                },
            },
        });
        return products;
    } catch (error) {
        throw error;
    }
}

export const getProductById = async (id: number) => {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id,
            },
            include: {
                category: true,
            },
        });
        return product;
    } catch (error) {
        throw error;
    }
}

export const createProduct = async (data: any) => {
    try {
        const { stocks, stock, note, ...rest } = data;
        const initialStock = Number(stocks || 0);

        const product = await prisma.product.create({
            data: {
                ...rest,
                stocks: {
                    create: {
                        total: initialStock,
                        type: "IN",
                        note: note || "Initial stock"
                    }
                }
            },
            include: {
                stocks: true
            }
        });

        return product;
    } catch (error) {
        throw error;
    }
}

export const updateProduct = async (id: number, data: any) => {
    try {
        const { stocks, stock, note, ...rest } = data;
        
        // If stocks or stock is provided, create a new ADJUSTMENT entry
        const updateData: any = { ...rest };
        const newStockValue = stocks !== undefined ? stocks : stock;

        if (newStockValue !== undefined) {
            updateData.stocks = {
                create: {
                    total: Number(newStockValue),
                    type: "ADJUSTMENT",
                    note: note || "Stock updated via product edit"
                }
            };
        }

        const product = await prisma.product.update({
            where: {
                id,
            },
            data: updateData,
            include: {
                stocks: true
            }
        });

        return product;
    } catch (error) {
        throw error;
    }
}

export const deleteProduct = async (id: number) => {
    try {
        const product = await prisma.product.delete({
            where: {
                id,
            },
        });
        return product;
    } catch (error) {
        throw error;
    }
}

