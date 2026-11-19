'use client';

import { Edit2, Trash2, Package, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Product } from '@/types/product';
import { formatVND } from '@/libs/utils';

interface ProductTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export default function ProductTableRow({ product, onEdit, onDelete }: ProductTableRowProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <tr className="border-b border-[#E4E4E0] hover:bg-[#F7F7F5]/60 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#F7F7F5] border border-[#E4E4E0] overflow-hidden flex items-center justify-center shrink-0">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={20} className="text-[#6E6E77]" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-[#18181B]">{product.name}</p>
            <p className="text-[11px] text-[#6E6E77] font-mono mt-0.5">Mã SP: #{product.id}</p>
          </div>
        </div>
      </td>

      <td className="py-3 px-4 font-mono font-bold text-sm text-[#18181B]">
        {formatVND(product.price)}
      </td>

      <td className="py-3 px-4 font-mono text-sm font-semibold text-[#18181B]">
        {product.stock} cái
      </td>

      <td className="py-3 px-4">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Hết hàng
          </span>
        ) : isLowStock ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle size={12} /> Cảnh báo: Sắp hết ({product.stock})
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20">
            <CheckCircle2 size={12} /> Đầy đủ ({product.stock})
          </span>
        )}
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(product)}
            title="Chỉnh sửa sản phẩm"
            className="p-1.5 rounded-lg text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] border border-transparent hover:border-[#E4E4E0] transition"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            title="Xóa sản phẩm"
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
