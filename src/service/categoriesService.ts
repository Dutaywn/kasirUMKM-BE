import {prisma} from "../../lib/prisma.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../types/category.dto.js";

export const getAllCategories = async () => {
    try {
        const categories = await prisma.category.findMany();
        return categories;
    } catch (error) {
        throw error;
    }
}

export const getCategoryById = async (id: number) => {
    try {
        const category = await prisma.category.findUnique({
            where: {
                id,
            },
        });
        return category;
    } catch (error) {
        throw error;
    }
}

export const createCategory = async (data: CreateCategoryDTO) => {
    try {
        const category = await prisma.category.create({
            data,
        });
        return category;
    } catch (error) {
        throw error;
    }
}

export const updateCategory = async (id: number, data: UpdateCategoryDTO) => {
    try {
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

export const deleteCategory = async (id: number) => {
    try {
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