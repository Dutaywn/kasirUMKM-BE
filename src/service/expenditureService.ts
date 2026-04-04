import { prisma } from "../../lib/prisma.js";
import { CreateExpenditureDTO, UpdateExpenditureDTO } from "../types/expenditure.dto.js";

export const getAllExpenditures = async (userId: number, page: number = 1, limit: number = 10, search?: string) => {
    try {
        const skip = (page - 1) * limit;
        const take = limit;

        const where: any = { userId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { note: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [expenditures, total] = await Promise.all([
            prisma.expenditure.findMany({
                where,
                skip,
                take,
                include: {
                    user: {
                        select: {
                            id: true,
                            userName: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.expenditure.count({ where }),
        ]);

        return { expenditures, total };
    } catch (error) {
        throw error;
    }
};

export const getExpenditureById = async (id: number, userId: number) => {
    try {
        const expenditure = await prisma.expenditure.findFirst({
            where: { id, userId },
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        email: true,
                    },
                },
            },
        });
        return expenditure;
    } catch (error) {
        throw error;
    }
};

export const createExpenditure = async (data: CreateExpenditureDTO, userId: number) => {
    try {
        const expenditure = await prisma.expenditure.create({
            data: { ...data, userId },
        });
        return expenditure;
    } catch (error) {
        throw error;
    }
};

export const updateExpenditure = async (id: number, data: UpdateExpenditureDTO, userId: number) => {
    try {
        // Verify ownership
        const existingExpenditure = await prisma.expenditure.findFirst({
            where: { id, userId }
        });
        if (!existingExpenditure) {
            throw new Error("Expenditure not found or you don't have permission to modify it");
        }

        const expenditure = await prisma.expenditure.update({
            where: { id },
            data,
        });
        return expenditure;
    } catch (error) {
        throw error;
    }
};

export const deleteExpenditure = async (id: number, userId: number) => {
    try {
        // Verify ownership
        const existingExpenditure = await prisma.expenditure.findFirst({
            where: { id, userId }
        });
        if (!existingExpenditure) {
            throw new Error("Expenditure not found or you don't have permission to delete it");
        }

        const expenditure = await prisma.expenditure.delete({
            where: { id },
        });
        return expenditure;
    } catch (error) {
        throw error;
    }
};
