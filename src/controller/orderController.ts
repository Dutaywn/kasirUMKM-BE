import { Request, Response } from "express";
import * as orderService from "../service/orderService.js";
import { CreateOrderDTO } from "../types/order.dto.js";

import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const data: CreateOrderDTO = { ...req.body, userId };
        const order = await orderService.createOrder(data);
        res.status(201).json({
            message: "Order created successfully",
            data: order
        });
    } catch (error: any) {
        res.status(400).json({
            message: error.message || "Failed to create order"
        });
    }
};

export const getAllOrders = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const paymentStatus = req.query.paymentStatus as string;
        const paymentMethod = req.query.paymentMethod as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { orders, total } = await orderService.getAllOrders(
            userId,
            page, 
            limit, 
            search, 
            paymentStatus, 
            paymentMethod, 
            startDate, 
            endDate
        );
        
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            message: "Orders retrieved successfully",
            data: orders,
            pagination: {
                page,
                limit,
                totalItems: total,
                totalPages,
                hasNextPage: page < totalPages
            }
        });
    } catch (error: any) {
        res.status(500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const userId = Number(req.user?.userId);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const order = await orderService.getOrderById(id, userId);
        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }
        res.status(200).json({
            message: "Order retrieved successfully",
            data: order
        });
    } catch (error: any) {
        res.status(500).json({
            message: error.message || "Internal server error"
        });
    }
};
