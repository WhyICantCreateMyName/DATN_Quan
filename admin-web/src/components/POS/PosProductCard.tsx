'use client';

import { Tag, Dumbbell, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { PosItem } from '@/types/pos';
import { formatVND } from '@/libs/utils';

interface PosProductCardProps {
  item: PosItem;
  onAdd: (item: PosItem) => void;
}

export default function PosProductCard({ item, onAdd }: PosProductCardProps) {
  const isPlan = item.type === 'membership';
  const isOutOfStock = !isPlan && (item.stock === undefined || item.stock <= 0);
  const isLowStock = !isPlan && item.stock !== undefined && item.stock > 0 && item.stock <= 5;

  return (
    <div
      onClick={() => !isOutOfStock && onAdd(item)}
      className={`bg-[#FFFFFF] border rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 group text-left relative overflow-hidden select-none ${
        isOutOfStock
          ? 'opacity-60 cursor-not-allowed border-[#E4E4E0] bg-[#F7F7F5]/50'
          : 'cursor-pointer border-[#E4E4E0] hover:border-[#EA580C]/40 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top media / icon */}
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-[#F7F7F5] border border-[#E4E4E0] flex items-center justify-center relative">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : isPlan ? (
            <div className="flex flex-col items-center justify-center gap-1 text-[#EA580C]">
              <div className="w-10 h-10 rounded-xl bg-[#EA580C]/10 flex items-center justify-center">
                <Tag size={20} />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#EA580C]">
                {item.tag || 'GÓI TẬP'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-[#6E6E77]">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Dumbbell size={20} />
              </div>
            </div>
          )}

          {/* Quick badge */}
          {isPlan && item.ptSessions && item.ptSessions > 0 ? (
            <div className="absolute top-2 left-2 bg-[#15803D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles size={10} /> +{item.ptSessions} PT
            </div>
          ) : null}

          {!isPlan && isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">
                HẾT HÀNG
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="font-semibold text-sm text-[#18181B] line-clamp-2 leading-snug min-h-[2.5rem]">
          {item.name}
        </h4>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-[#E4E4E0] flex items-center justify-between">
        <div>
          <p className="font-mono font-bold text-sm text-[#18181B]">
            {formatVND(item.price)}
          </p>
          <div className="text-[11px] text-[#6E6E77] mt-0.5">
            {isPlan ? (
              <span>{item.durationDays} ngày tập</span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertCircle size={11} /> Còn {item.stock} cái
              </span>
            ) : (
              <span>Kho: {item.stock ?? 0}</span>
            )}
          </div>
        </div>

        <button
          disabled={isOutOfStock}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
            isOutOfStock
              ? 'bg-zinc-200 text-zinc-400'
              : 'bg-[#F7F7F5] group-hover:bg-[#EA580C] group-hover:text-white text-[#18181B] border border-[#E4E4E0]'
          }`}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
