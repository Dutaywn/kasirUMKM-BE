import { prisma } from "../../lib/prisma.js";
import { CreateOrderDTO } from "../types/order.dto.js";

export const createOrder = async (data: CreateOrderDTO) => {
    const { userId, paymentMethod, items } = data;

    try {
        return await prisma.$transaction(async (tx: any) => {
            let totalAmount = 0;
            const orderItemsData: {
                productId: number,
                quantity: number,
                priceAtPurchase: number
            }[] = [];

            for (const item of items) {
                // 1. Fetch the product to get the current price and stock, AND verify it belongs to the buyer.
                const product = await tx.product.findFirst({
                    where: { id: item.productId, userId: userId },
                });

                if (!product) {
                    throw new Error(`Product with id ${item.productId} not found or doesn't belong to you`);
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
            const generateOrderCode = () => {
                const timestamp = Date.now();
                const random = Math.floor(Math.random() * 1000);
                return `ORD-${timestamp}-${random}`;
            };
            const statusPayment = paymentMethod === "CASH" || "QRIS" ? "PAID" : "PENDING";
            const orderCode = generateOrderCode();

            // 5. Create the order
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    orderCode,
                    paymentMethod,
                    paymentStatus: statusPayment,
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

export const getAllOrders = async (
    userId: number,
    page: number = 1,
    limit: number = 10,
    search?: string,
    paymentStatus?: string,
    paymentMethod?: string,
    startDate?: string,
    endDate?: string
) => {
    try {
        const skip = (page - 1) * limit;
        const take = limit;

        const where: any = { userId };

        // 🔹 FILTER (lebih presisi)
        if (paymentStatus) {
            where.paymentStatus = paymentStatus;
        }

        if (paymentMethod) {
            where.paymentMethod = paymentMethod;
        }

        // 🔹 DATE RANGE FILTER
        if (startDate && endDate) {
            const start = new Date(`${startDate}T00:00:00.000Z`);
            const end = new Date(`${endDate}T23:59:59.999Z`);

            where.createdAt = {
                gte: start,
                lte: end
            };
        } else if (startDate) {
            const start = new Date(`${startDate}T00:00:00.000Z`);
            where.createdAt = {
                gte: start
            };
        } else if (endDate) {
            const end = new Date(`${endDate}T23:59:59.999Z`);
            where.createdAt = {
                lte: end
            };
        }

        // 🔹 SEARCH (flexible)
        if (search) {
            const cleanSearch = search.replace(/"/g, "").trim();

            where.OR = [
                // ✅ order code
                {
                    orderCode: {
                        contains: cleanSearch,
                        mode: "insensitive"
                    }
                },

                // ✅ user
                {
                    user: {
                        userName: {
                            contains: cleanSearch,
                            mode: "insensitive"
                        }
                    }
                },

                // ✅ product (heavy)
                ...(cleanSearch.length >= 3 ? [{
                    items: {
                        some: {
                            product: {
                                name: {
                                    contains: cleanSearch,
                                    mode: "insensitive"
                                }
                            }
                        }
                    }
                }] : [])
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take,
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
            }),
            prisma.order.count({ where }),
        ]);

        return { orders, total };
    } catch (error) {
        throw error;
    }
};

export const getOrderById = async (id: number, userId: number) => {
    try {
        return await prisma.order.findFirst({
            where: { id, userId },
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