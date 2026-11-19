'use client';

import { Package, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductTable from './ProductTable';

export default function Inventory() {
  const { data: allProdsRes } = useProducts({ page: 1, limit: 100 });
  const allProds = allProdsRes?.data || [];

  const outOfStockCount = allProds.filter((p) => p.stock <= 0).length;
  const lowStockCount = allProds.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const inStockCount = allProds.filter((p) => p.stock > 5).length;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E4E4E0] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#18181B]">
            Quản Lý Kho Hàng & Sản Phẩm Bán Lẻ
          </h1>
          <p className="text-sm text-[#6E6E77] mt-1">
            Theo dõi lượng tồn kho, giá bán lẻ đồ uống, thực phẩm bổ sung và phụ kiện tập luyện
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6E6E77] uppercase tracking-wider">
              Hàng Sẵn Sàng Bán
            </p>
            <p className="font-mono text-xl font-bold text-[#18181B] mt-0.5">
              {inStockCount} <span className="text-xs font-normal text-[#6E6E77]">mặt hàng</span>
            </p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6E6E77] uppercase tracking-wider">
              Cảnh Báo: Sắp Hết (≤5)
            </p>
            <p className="font-mono text-xl font-bold text-amber-700 mt-0.5">
              {lowStockCount} <span className="text-xs font-normal text-[#6E6E77]">mặt hàng</span>
            </p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
            <Package size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6E6E77] uppercase tracking-wider">
              Hết Hàng Trong Kho
            </p>
            <p className="font-mono text-xl font-bold text-rose-700 mt-0.5">
              {outOfStockCount} <span className="text-xs font-normal text-[#6E6E77]">mặt hàng</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <ProductTable />
    </div>
  );
}
