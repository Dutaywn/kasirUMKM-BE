export interface CreateProductDTO {
  name: string;
  imgUrl?: string;
  price: number;
  categoryId: number;
  stocks: number;
  stockType: string;
  note?: string;
}

export interface UpdateProductDTO {
  name?: string;
  imgUrl?: string;
  price?: number;
  categoryId?: number;
  stocks?: number;
  stockType?: string;
  note?: string;
}
