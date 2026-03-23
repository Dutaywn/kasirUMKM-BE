import express from "express";
import "dotenv/config";
import authRoutes from "./route/authRoutes.js";
import productRoutes from "./route/productRoutes.js";
import categoriesRoutes from "./route/categoriesRoutes.js";
import stockRoutes from "./route/stockRoutes.js";
import orderRoutes from "./route/orderRoutes.js";
import cors from "cors";

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup: Allow frontend or dynamic origin in production
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
];

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    console.log("Origin:", origin);

    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.includes("vercel.app")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.options("*", cors());


app.get("/", (req, res) => {
  res.json({ message: "UMKM Kasir API is running! 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/orders", orderRoutes);

// Export for Vercel serverless functions
export default app;

// Listen only when running directly (not as a serverless function)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`\n✅ Server is running at http://localhost:${PORT}`);
  });
}
