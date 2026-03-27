import { prisma } from "../../lib/prisma.js";
import { CreateExpenditureDTO, UpdateExpenditureDTO } from "../types/expenditure.dto.js";

export const getAllExpenditures = async () => {
    try {
        const expenditures = await prisma.expenditure.findMany({
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
        });
        return expenditures;
    } catch (error) {
        throw error;
    }
};

export const getExpenditureById = async (id: number) => {
    try {
        const expenditure = await prisma.expenditure.findUnique({
            where: { id },
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

export const createExpenditure = async (data: CreateExpenditureDTO) => {
    try {
        const expenditure = await prisma.expenditure.create({
            data,
        });
        return expenditure;
    } catch (error) {
        throw error;
    }
};

export const updateExpenditure = async (id: number, data: UpdateExpenditureDTO) => {
    try {
        const expenditure = await prisma.expenditure.update({
            where: { id },
            data,
        });
        return expenditure;
    } catch (error) {
        throw error;
    }
};

export const deleteExpenditure = async (id: number) => {
    try {
        const expenditure = await prisma.expenditure.delete({
            where: { id },
        });
        return expenditure;
    } catch (error) {
        throw error;
    }
};
