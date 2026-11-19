export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export type ProductCreateInput = CreateProductDto;

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
