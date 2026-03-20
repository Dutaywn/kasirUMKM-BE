export interface CreateProductDTO {
  name: string;
  imgUrl?: string;
  price: number;
  categoryId: number;
  stocks: number;
  note?: string;
}

export interface UpdateProductDTO {
  name?: string;
  imgUrl?: string;
  price?: number;
  categoryId?: number;
  stocks?: number;
  note?: string;
}
