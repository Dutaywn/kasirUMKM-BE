import { prisma } from "../../lib/prisma.js";

export const generateReport = async (
    start: Date,
    end: Date,
    periodType: "DAILY" | "WEEKLY" | "MONTHLY",
    userId: number
) => {
    const startOfDay = new Date(start);
    const endOfDay = new Date(end);
    

    // 1. Aggregates (Income)
    const incomeAgg = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
            userId,
            paymentStatus: "PAID",
            createdAt: { gte: startOfDay, lte: endOfDay },
        },
    });

    // 2. Aggregates (Orders Count)
    const ordersCount = await prisma.order.count({
        where: {
            userId,
            createdAt: { gte: startOfDay, lte: endOfDay },
        },
    });

    // 3. Aggregates (Expense)
    const expenseAgg = await prisma.expenditure.aggregate({
        _sum: { price: true },
        where: {
            userId,
            createdAt: { gte: startOfDay, lte: endOfDay },
        },
    });

    const totalOrders = ordersCount;
    const totalIncome = incomeAgg._sum.totalAmount || 0;
    const totalExpense = expenseAgg._sum.price || 0;
    const netProfit = totalIncome - totalExpense;

    // 4. Top Products (Grouped by productId)
    const topProducts = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        where: {
            order: {
                userId,
                createdAt: { gte: startOfDay, lte: endOfDay },
                paymentStatus: "PAID",
            },
        },
        orderBy: {
            _sum: { quantity: "desc" },
        },
        take: 5,
    });

    let topProductsData: any = [];
    if (topProducts.length > 0) {
        const productIds = topProducts.map((p) => p.productId);
        const productsInfo = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
        });

        topProductsData = topProducts.map((p) => {
            const info = productsInfo.find((pi) => pi.id === p.productId);
            return {
                productId: p.productId,
                name: info?.name || "Unknown Product",
                quantity: p._sum.quantity || 0,
            };
        });
    }

    // 5. Upsert the Summary Report
    const savedReport = await prisma.reportSummary.upsert({
        where: {
            userId_date_periodType: { userId, date: startOfDay, periodType: periodType },
        },
        update: {
            totalIncome,
            totalExpense,
            netProfit,
            totalOrders,
            topProductsData,
        },
        create: {
            userId,
            date: startOfDay,
            periodType: periodType,
            totalIncome,
            totalExpense,
            netProfit,
            totalOrders,
            topProductsData,
        },
    });

    return savedReport;
};

export const getReports = async (
    userId: number,
    page: number = 1,
    limit: number = 10,
    period?: string,
    search?: string,
    startDate?: string,
    endDate?: string
) => {
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (period) {
        where.periodType = period;
    }

    // Keyword Search (by periodType or search keyword in periodType)
    if (search) {
        where.periodType = {
            contains: search,
            mode: "insensitive",
        };
    }

    // 🔹 DATE RANGE FILTER (applies to report 'date')
    if (startDate && endDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);
        where.date = { gte: start, lte: end };
    } else if (startDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        where.date = { gte: start };
    } else if (endDate) {
        const end = new Date(`${endDate}T23:59:59.999Z`);
        where.date = { lte: end };
    }

    const [reports, total] = await Promise.all([
        prisma.reportSummary.findMany({
            where,
            orderBy: { date: "desc" },
            skip,
            take: limit,
        }),
        prisma.reportSummary.count({ where }),
    ]);

    return { reports, total };
};

export const deleteReport = async (id: number, userId: number) => {
    return await prisma.reportSummary.deleteMany({
        where: { id, userId },
    });
};
