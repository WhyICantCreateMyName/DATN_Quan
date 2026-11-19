'use client';

import { useState } from 'react';
import { Plus, Package, RefreshCw, Search } from 'lucide-react';
import { Product } from '@/types/product';
import { useProducts, useProductMutations } from '@/hooks/useProducts';
import ProductTableHeader from './ProductTableHeader';
import ProductTableRow from './ProductTableRow';
import ModalCreateProduct from './ModalCreateProduct';
import ModalEditProduct from './ModalEditProduct';
import Pagination from '@/components/Pagination';

export default function ProductTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  const { data: productsRes, isLoading, mutate } = useProducts({ page, limit, search });
  const { deleteProduct } = useProductMutations();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const products = productsRes?.data || [];
  const total = productsRes?.total || 0;

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa mặt hàng này khỏi kho?')) {
      try {
        await deleteProduct(id);
      } catch (e) {
        // Handled by Toast in hook
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#FFFFFF] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2 text-xs text-[#18181B] outline-none focus:border-[#EA580C] shadow-xs transition"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => mutate()}
            disabled={isLoading}
            className="p-2 text-[#6E6E77] hover:text-[#18181B] hover:bg-[#FFFFFF] rounded-xl border border-[#E4E4E0] transition"
            title="Làm mới kho"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
          >
            <Plus size={16} />
            Nhập Hàng Mới
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <ProductTableHeader />
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[#6E6E77]">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#EA580C]/30 border-t-[#EA580C] rounded-full animate-spin"></span>
                      Đang đồng bộ số liệu tồn kho...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Package className="mx-auto text-[#6E6E77] mb-2 opacity-50" size={32} />
                    <p className="text-sm font-medium text-[#18181B]">Không tìm thấy mặt hàng nào</p>
                    <p className="text-xs text-[#6E6E77] mt-0.5">
                      Bấm &quot;Nhập Hàng Mới&quot; để bổ sung mặt hàng bán lẻ vào kho TitanGym.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <ProductTableRow
                    key={p.id}
                    product={p}
                    onEdit={(prod) => setEditingProduct(prod)}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {total > limit && (
          <div className="p-4 border-t border-[#E4E4E0] bg-[#F7F7F5]/30 flex justify-between items-center">
            <div className="text-xs text-[#6E6E77]">
              Hiển thị <span className="font-semibold text-[#18181B]">{products.length}</span> trên tổng số{' '}
              <span className="font-semibold text-[#18181B]">{total}</span> mặt hàng
            </div>
            <Pagination
              currentPage={page}
              totalItems={total}
              limit={limit}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ModalCreateProduct
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <ModalEditProduct
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
      />
    </div>
  );
}
