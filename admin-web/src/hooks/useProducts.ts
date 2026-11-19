'use client';

import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { productService } from '@/services/productService';
import { Product, CreateProductDto, UpdateProductDto, ProductQueryParams } from '@/types/product';
import { PaginationResponse } from '@/types';
import { Toast } from '@/context/ToastContext';

export const useProducts = (params?: ProductQueryParams) => {
  return useSWR(
    ['products', params],
    async () => {
      try {
        const result = await productService.getProducts(params);
        return result as PaginationResponse<Product>;
      } catch (error) {
        return { data: [], limit: 20, page: 1, total: 0 } as PaginationResponse<Product>;
      }
    },
    {
      dedupingInterval: 10000,
      revalidateOnFocus: false,
    }
  );
};

export const useProductDetail = (productId?: number | null) => {
  return useSWR(
    productId ? ['productDetail', productId] : null,
    async () => {
      if (!productId) return null;
      return await productService.getProductById(productId);
    },
    {
      dedupingInterval: 10000,
      revalidateOnFocus: false,
    }
  );
};

export const useProductMutations = () => {
  const { trigger: createProduct, isMutating: isCreatingProduct } = useSWRMutation(
    'createProduct',
    async (_key: string, { arg }: { arg: CreateProductDto }) => {
      try {
        const result = await productService.createProduct(arg);
        Toast.show({
          title: 'Thành công',
          message: `Đã nhập mặt hàng "${result.name}" vào kho!`,
          variant: 'success',
        });
        mutate((key: any) => Array.isArray(key) && key[0] === 'products', undefined, { revalidate: true });
        return result;
      } catch (error: any) {
        Toast.show({
          title: 'Lỗi',
          message: error?.response?.data?.error || error?.message || 'Có lỗi xảy ra khi tạo mặt hàng!',
          variant: 'error',
        });
        throw error;
      }
    }
  );

  const { trigger: updateProduct, isMutating: isUpdatingProduct } = useSWRMutation(
    'updateProduct',
    async (_key: string, { arg }: { arg: { productId: number; data: UpdateProductDto } }) => {
      try {
        const result = await productService.updateProduct(arg.productId, arg.data);
        Toast.show({
          title: 'Thành công',
          message: `Đã cập nhật mặt hàng "${result.name}"!`,
          variant: 'success',
        });
        mutate((key: any) => Array.isArray(key) && key[0] === 'products', undefined, { revalidate: true });
        return result;
      } catch (error: any) {
        Toast.show({
          title: 'Lỗi',
          message: error?.response?.data?.error || error?.message || 'Có lỗi xảy ra khi cập nhật mặt hàng!',
          variant: 'error',
        });
        throw error;
      }
    }
  );

  const { trigger: deleteProduct, isMutating: isDeletingProduct } = useSWRMutation(
    'deleteProduct',
    async (_key: string, { arg }: { arg: number }) => {
      try {
        const result = await productService.deleteProduct(arg);
        Toast.show({
          title: 'Thành công',
          message: 'Đã xóa mặt hàng khỏi kho!',
          variant: 'success',
        });
        mutate((key: any) => Array.isArray(key) && key[0] === 'products', undefined, { revalidate: true });
        return result;
      } catch (error: any) {
        Toast.show({
          title: 'Lỗi',
          message: error?.response?.data?.error || error?.message || 'Có lỗi xảy ra khi xóa mặt hàng!',
          variant: 'error',
        });
        throw error;
      }
    }
  );

  return {
    createProduct,
    isCreatingProduct,
    updateProduct,
    isUpdatingProduct,
    deleteProduct,
    isDeletingProduct,
  };
};
