import axiosClient from './axiosClient';
import { Product, CreateProductDto, UpdateProductDto, ProductQueryParams } from '@/types/product';
import { PaginationResponse } from '@/types';

export const productService = {
  getProducts: (params?: ProductQueryParams): Promise<PaginationResponse<Product>> => {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const search = params?.search ? `&search=${encodeURIComponent(params.search)}` : '';
    return axiosClient.get(`/pos/products?page=${page}&limit=${limit}${search}`);
  },

  getProductById: (id: number): Promise<Product> =>
    axiosClient.get(`/pos/products/${id}`),

  createProduct: (data: CreateProductDto): Promise<Product> =>
    axiosClient.post('/pos/products', data),

  updateProduct: (id: number, data: UpdateProductDto): Promise<Product> =>
    axiosClient.patch(`/pos/products/${id}`, data),

  deleteProduct: (id: number): Promise<{ success: boolean }> =>
    axiosClient.delete(`/pos/products/${id}`),
};
