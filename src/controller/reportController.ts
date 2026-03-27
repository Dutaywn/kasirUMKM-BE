import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const generateDailyReport = async (req: Request, res: Response) => {
  try {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

    const incomeAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const ordersCount = await prisma.order.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const expenseAgg = await prisma.expenditure.aggregate({
      _sum: { price: true },
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const totalOrders = ordersCount;
    const totalIncome = incomeAgg._sum.totalAmount || 0;
    const totalExpense = expenseAgg._sum.price || 0;
    const netProfit = totalIncome - totalExpense;

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: {
        order: {
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

    const existingReport = await prisma.reportSummary.findUnique({
      where: {
        date_periodType: { date: startOfDay, periodType: "DAILY" },
      },
    });

    const savedReport = await prisma.reportSummary.upsert({
      where: {
        date_periodType: { date: startOfDay, periodType: "DAILY" },
      },
      update: {
        totalIncome,
        totalExpense,
        netProfit,
        totalOrders,
        topProductsData,
      },
      create: {
        date: startOfDay,
        periodType: "DAILY",
        totalIncome,
        totalExpense,
        netProfit,
        totalOrders,
        topProductsData,
      },
    });

    res.status(200).json({
      message: existingReport
        ? "Laporan hari ini sudah ada, data berhasil diperbarui (Update Tutup Buku)."
        : "Laporan harian berhasil di-generate dan disimpan.",
      data: savedReport,
    });
  } catch (error) {
    console.error("Error generating daily report:", error);
    res.status(500).json({ message: "Gagal men-generate laporan harian." });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const { period } = req.query; // DAILY, MONTHLY, YEARLY
    const reports = await prisma.reportSummary.findMany({
      where: period ? { periodType: period as string } : undefined,
      orderBy: { date: "desc" },
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Gagal mengambil data laporan." });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedReport = await prisma.reportSummary.delete({
      where: { id: parseInt(id as string) },
    });
    res.status(200).json({
      message: "Laporan berhasil dihapus.",
      data: deletedReport,
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Gagal menghapus laporan. Pastikan ID valid." });
  }
};
