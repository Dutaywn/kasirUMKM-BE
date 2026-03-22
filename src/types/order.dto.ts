import { PaymentMethod, OrderStatus } from "../../generated/prisma";

export interface CreateOrderDTO {
    userId: number;
    paymentMethod: PaymentMethod;
    paymentStatus?: OrderStatus;
    items: {
        productId: number;
        quantity: number;
        stockId: number;
    }[];
}

export interface UpdateOrderDTO {
    id: number;
    userId?: number;
    paymentMethod?: PaymentMethod;
    paymentStatus?: OrderStatus;
    items?: {
        productId: number;
        quantity: number;
        stockId: number;
    }[];
}