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
            const statusPayment = paymentMethod === "CASH" ? "PAID" : "PENDING";

            // 5. Create the order
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
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

export const getAllOrders = async (page: number = 1, limit: number = 10, search?: string) => {
    try {
        const skip = (page - 1) * limit;
        const take = limit;

        const where: any = {};
        if (search) {
            // Clean the search string (remove quotes and extra whitespace)
            const cleanSearch = search.replace(/["]/g, "").trim();
            const upperSearch = cleanSearch.toUpperCase();

            // Valid enum values from schema
            const validPaymentMethods = ["CASH", "QRIS", "TRANSFER"];
            const validOrderStatuses = ["PENDING", "PAID", "CANCELLED"];

            // Base conditions for non-enum fields
            const orConditions: any[] = [
                { user: { userName: { contains: cleanSearch, mode: "insensitive" } } },
                {
                    items: {
                        some: {
                            product: {
                                name: { contains: cleanSearch, mode: "insensitive" }
                            }
                        }
                    }
                }
            ];

            // Only add Enum fields if search term exactly matches an enum value
            if (validPaymentMethods.includes(upperSearch)) {
                orConditions.push({ paymentMethod: upperSearch });
            }
            if (validOrderStatuses.includes(upperSearch)) {
                orConditions.push({ paymentStatus: upperSearch });
            }

            // Check if the search term is a valid date (YYYY-MM-DD format)
            const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
            if (dateRegex.test(cleanSearch)) {
                const startDate = new Date(cleanSearch);
                if (startDate.toString() !== "Invalid Date") {
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 1);

                    orConditions.push({
                        createdAt: {
                            gte: startDate,
                            lt: endDate
                        }
                    });
                }
            }

            where.OR = orConditions;
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