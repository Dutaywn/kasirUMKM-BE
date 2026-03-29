import { Request, Response } from "express";
import * as orderService from "../service/orderService.js";
import { CreateOrderDTO } from "../types/order.dto.js";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const data: CreateOrderDTO = req.body;
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

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;

        const { orders, total } = await orderService.getAllOrders(page, limit, search);
        
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

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const order = await orderService.getOrderById(id);
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
