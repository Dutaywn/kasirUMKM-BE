import express from "express";
import "dotenv/config";
import authRoutes from "./route/authRoutes";
import productRoutes from "./route/productRoutes";
import categoriesRoutes from "./route/categoriesRoutes";
import stockRoutes from "./route/stockRoutes";
import orderRoutes from "./route/orderRoutes";
import cors from "cors";

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/orders", orderRoutes);

// app.get("/api/test", (req, res) => {
//   res.json({ message: "Server is running! 🚀" });
// });

// app.use("/api/product", productRoutes);
// app.use("/api/categories", categoriesRoutes);
// app.use("/api/stock", stockRoutes);

app.listen(PORT, () => {
  console.log(`\n✅ Server is running at http://localhost:${PORT}`);
});
