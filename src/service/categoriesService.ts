import {prisma} from "../../lib/prisma.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../types/category.dto.js";

export const getAllCategories = async (userId: number) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId }
        });
        return categories;
    } catch (error) {
        throw error;
    }
}

export const getCategoryById = async (id: number, userId: number) => {
    try {
        const category = await prisma.category.findFirst({
            where: {
                id,
                userId,
            },
        });
        return category;
    } catch (error) {
        throw error;
    }
}

export const createCategory = async (data: CreateCategoryDTO, userId: number) => {
    try {
        const category = await prisma.category.create({
            data: {
                ...data,
                userId
            },
        });
        return category;
    } catch (error) {
        throw error;
    }
}

export const updateCategory = async (id: number, data: UpdateCategoryDTO, userId: number) => {
    try {
        // First verify the category belongs to the user
        const existingCategory = await prisma.category.findFirst({
            where: { id, userId }
        });
        if (!existingCategory) {
            throw new Error("Category not found or you don't have permission to modify it");
        }

        const category = await prisma.category.update({
            where: {
                id,
            },
            data,
        });
        return category;
    } catch (error) {
        throw error;
    }
}

export const deleteCategory = async (id: number, userId: number) => {
    try {
        // First verify the category belongs to the user
        const existingCategory = await prisma.category.findFirst({
            where: { id, userId }
        });
        if (!existingCategory) {
            throw new Error("Category not found or you don't have permission to delete it");
        }

        const category = await prisma.category.delete({
            where: {
                id,
            },
        });
        return category;
    } catch (error) {
        throw error;
    }
}