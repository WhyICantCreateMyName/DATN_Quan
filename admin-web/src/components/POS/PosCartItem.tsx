'use client';

import { Plus, Minus, Trash2, Tag, Dumbbell } from 'lucide-react';
import { CartItem } from '@/types/pos';
import { formatVND } from '@/libs/utils';

interface PosCartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export default function PosCartItem({ item, onUpdateQuantity, onRemove }: PosCartItemProps) {
  const isPlan = item.type === 'membership';

  return (
    <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-lg bg-[#F7F7F5] border border-[#E4E4E0] flex items-center justify-center shrink-0 overflow-hidden text-[#6E6E77]">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : isPlan ? (
            <Tag size={18} className="text-[#EA580C]" />
          ) : (
            <Dumbbell size={18} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-xs text-[#18181B] truncate">{item.name}</p>
          <p className="font-mono text-xs text-[#6E6E77] mt-0.5">
            {formatVND(item.price)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center border border-[#E4E4E0] rounded-lg bg-[#F7F7F5] overflow-hidden">
          <button
            onClick={() => onUpdateQuantity(item.id, -1)}
            className="p-1 hover:bg-[#FFFFFF] text-[#6E6E77] hover:text-[#18181B] transition"
          >
            <Minus size={13} />
          </button>
          <span className="w-7 text-center font-mono font-semibold text-xs text-[#18181B]">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="p-1 hover:bg-[#FFFFFF] text-[#6E6E77] hover:text-[#18181B] transition"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="w-16 text-right font-mono font-bold text-xs text-[#18181B]">
          {formatVND(item.price * item.quantity)}
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-[#6E6E77] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
