export interface CreateExpenditureDTO {
  name: string;
  price: number;
  note?: string;
  userId: number;
}

export interface UpdateExpenditureDTO {
  name?: string;
  price?: number;
  note?: string;
}
