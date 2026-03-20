import { StockType } from "../../generated/prisma";

export interface CreateStockDTO {
  productId: number;
  total: number;
  type?: StockType;
  note?: string;
}

export interface UpdateStockDTO {
  productId?: number;
  total?: number;
  type?: StockType;
  note?: string;
}
