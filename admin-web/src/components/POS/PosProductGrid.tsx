'use client';

import { Search, Tag, Package, Layers, Sparkles } from 'lucide-react';
import { PosItem } from '@/types/pos';
import PosProductCard from './PosProductCard';

interface PosProductGridProps {
  items: PosItem[];
  selectedCategory: 'ALL' | 'PLANS' | 'PRODUCTS';
  searchQuery: string;
  isLoading: boolean;
  onSelectCategory: (cat: 'ALL' | 'PLANS' | 'PRODUCTS') => void;
  onSearchChange: (query: string) => void;
  onAddToCart: (item: PosItem) => void;
}

export default function PosProductGrid({
  items,
  selectedCategory,
  searchQuery,
  isLoading,
  onSelectCategory,
  onSearchChange,
  onAddToCart,
}: PosProductGridProps) {
  return (
    <div className="flex-1 flex flex-col h-full space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc gói tập..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#18181B] outline-none focus:border-[#EA580C] shadow-xs transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex p-1 bg-[#F7F7F5] rounded-xl border border-[#E4E4E0] shrink-0">
          <button
            onClick={() => onSelectCategory('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'ALL'
                ? 'bg-[#FFFFFF] text-[#EA580C] shadow-xs border border-[#E4E4E0]'
                : 'text-[#6E6E77] hover:text-[#18181B]'
            }`}
          >
            <Layers size={13} />
            Tất Cả
          </button>
          <button
            onClick={() => onSelectCategory('PLANS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'PLANS'
                ? 'bg-[#FFFFFF] text-[#EA580C] shadow-xs border border-[#E4E4E0]'
                : 'text-[#6E6E77] hover:text-[#18181B]'
            }`}
          >
            <Tag size={13} />
            Gói Tập
          </button>
          <button
            onClick={() => onSelectCategory('PRODUCTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'PRODUCTS'
                ? 'bg-[#FFFFFF] text-[#EA580C] shadow-xs border border-[#E4E4E0]'
                : 'text-[#6E6E77] hover:text-[#18181B]'
            }`}
          >
            <Package size={13} />
            Bán Lẻ (Kho)
          </button>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-sm text-[#6E6E77]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#EA580C]/30 border-t-[#EA580C] rounded-full animate-spin"></span>
              Đang đồng bộ danh mục hàng hóa & gói tập...
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl">
            <Package size={36} className="text-[#6E6E77] opacity-40 mb-2" />
            <p className="font-semibold text-sm text-[#18181B]">Không tìm thấy mặt hàng nào</p>
            <p className="text-xs text-[#6E6E77] mt-1">
              Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục Tất cả.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-4">
            {items.map((item) => (
              <PosProductCard key={item.id} item={item} onAdd={onAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
