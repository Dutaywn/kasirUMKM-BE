import { prisma } from "../../lib/prisma";
import { CreateOrderDTO } from "../types/order.dto";

export const createOrder = async (data: CreateOrderDTO) => {
    const { userId, paymentMethod, paymentStatus, items } = data;

    try {
        return await prisma.$transaction(async (tx: any) => {
            let totalAmount = 0;
            const orderItemsData = [];

            for (const item of items) {
                // 1. Fetch the product to get the current price and stock
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new Error(`Product with id ${item.productId} not found`);
                }

                // 2. Check sufficient stock
                if ((product.stocks || 0) < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stocks}, Requested: ${item.quantity}`);
                }

                const currentPrice = product.price || 0;
                const itemTotal = currentPrice * item.quantity;
                totalAmount += itemTotal;

                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtPurchase: currentPrice
                });

                // 3. Decrement product stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stocks: {
                            decrement: item.quantity
                        }
                    }
                });

                // 4. Create an OUT log record in stock model
                await tx.stock.create({
                    data: {
                        type: "OUT",
                        total: item.quantity,
                        productId: item.productId,
                        note: `Order creation log (Item: ${product.name})`
                    }
                });
            }

            // 5. Create the order
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    paymentMethod,
                    paymentStatus: paymentStatus || "PENDING",
                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            return order;
        });
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

export const getAllOrders = async () => {
    try {
        return await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        userName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    } catch (error) {
        throw error;
    }
};

export const getOrderById = async (id: number) => {
    try {
        return await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        userName: true,
                        email: true
                    }
                }
            }
        });
    } catch (error) {
        throw error;
    }
};