import express from "express";
import "dotenv/config";
import authRoutes from "./route/authRoutes.js";
import productRoutes from "./route/productRoutes.js";
import categoriesRoutes from "./route/categoriesRoutes.js";
import stockRoutes from "./route/stockRoutes.js";
import orderRoutes from "./route/orderRoutes.js";
import reportRoutes from "./route/reportRoutes.js";
import expenditureRoutes from "./route/expenditureRoutes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.get("/", (req, res) => {
  res.json({ message: "UMKM Kasir API is running! 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/expenditures", expenditureRoutes);
// Export for Vercel serverless functions
export default app;

// Listen only when running directly (not as a serverless function)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`\n✅ Server is running at http://localhost:${PORT}`);
  });
}
