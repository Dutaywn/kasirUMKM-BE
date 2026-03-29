import { prisma } from "../../lib/prisma.js";
import { CreateProductDTO, UpdateProductDTO } from "../types/product.dto.js";


export const getAllProducts = async (page: number = 1, limit: number = 10, search?: string) => {
    try {
        const skip = (page - 1) * limit;
        const take = limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { category: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take,
                include: {
                    category: {
                        select: {
                            name: true,
                        }
                    },
                    stockId: {
                        select: {
                            id: true,
                            total: true,
                        }
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.product.count({ where }),
        ]);

        return { products, total };
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
        const { stocks, stockType, note, ...rest } = data;
        const initialStock = Number(stocks || 0);

        const product = await prisma.product.create({
            data: {
                ...rest,
                stocks: initialStock,
                stockType: stockType,
                stockId: {
                    create: {
                        total: initialStock,
                        type: "IN",
                        note: note || "Initial stock"
                    }
                }
            },
            include: {
                stockId: true
            }
        });

        return product;
    } catch (error) {
        throw error;
    }
}

export const updateProduct = async (id: number, data: any) => {
    try {
        const { stocks, stockType, note, ...rest } = data;
        
        const updateData: any = { ...rest };
        
        if (stockType !== undefined) {
            updateData.stockType = stockType;
        }

        if (stocks !== undefined) {
            updateData.stocks = Number(stocks);
            updateData.stockId = {
                create: {
                    total: Number(stocks),
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
                stockId: true
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

