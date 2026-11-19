'use client';

import { useState } from 'react';
import { ShoppingCart, Search, Lock, X, Banknote, CreditCard, QrCode, Trash2, ArrowRight } from 'lucide-react';
import { CartItem } from '@/types/pos';
import { MemberLookupResponse } from '@/services/checkinService';
import { formatVND } from '@/libs/utils';
import PosCartItem from './PosCartItem';

interface PosCartProps {
  cart: CartItem[];
  totalAmount: number;
  lockedMember: MemberLookupResponse | null;
  isSubmitting: boolean;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
  onLookupMember: (phone: string) => Promise<any>;
  onClearMember: () => void;
  onCheckout: (paymentMethod: string) => void;
}

export default function PosCart({
  cart,
  totalAmount,
  lockedMember,
  isSubmitting,
  onUpdateQuantity,
  onRemove,
  onClearCart,
  onLookupMember,
  onClearMember,
  onCheckout,
}: PosCartProps) {
  const [phoneInput, setPhoneInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'MOMO' | 'CARD'>('CASH');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    setIsSearching(true);
    try {
      await onLookupMember(phoneInput);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full lg:w-[420px] bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl p-5 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center border border-[#EA580C]/20">
            <ShoppingCart size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#18181B]">Hóa Đơn Bán Hàng</h3>
            <p className="text-[11px] text-[#6E6E77]">{cart.length} mặt hàng trong đơn</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-[11px] text-[#6E6E77] hover:text-rose-600 flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition"
          >
            <Trash2 size={12} /> Xóa đơn
          </button>
        )}
      </div>

      {/* Member Lock Section */}
      <div className="pt-4 pb-3">
        {!lockedMember ? (
          <form onSubmit={handleSearchMember} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={15} />
            <input
              type="text"
              placeholder="Nhập SĐT hội viên (nếu có)..."
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-9 pr-20 py-2 text-xs text-[#18181B] outline-none focus:border-[#EA580C] focus:bg-[#FFFFFF] transition"
            />
            <button
              type="submit"
              disabled={isSearching || !phoneInput.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#18181B] hover:bg-[#27272A] text-white text-[11px] font-semibold rounded-lg disabled:opacity-40 transition"
            >
              {isSearching ? '...' : 'Khóa'}
            </button>
          </form>
        ) : (
          <div className="bg-[#15803D]/10 border border-[#15803D]/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#15803D] text-white flex items-center justify-center shrink-0">
                <Lock size={13} />
              </div>
              <div>
                <p className="font-bold text-xs text-[#15803D] uppercase tracking-wider">
                  {lockedMember.name}
                </p>
                <p className="text-[11px] text-[#18181B]/80 mt-0.5">
                  Ví PT: <span className="font-mono font-bold text-[#15803D]">{lockedMember.remainingPtSessions ?? 0}</span> buổi
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClearMember();
                setPhoneInput('');
              }}
              className="text-[#6E6E77] hover:text-[#18181B] p-1.5 hover:bg-white rounded-lg transition"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 min-h-[180px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6E6E77]">
            <ShoppingCart size={32} className="opacity-30 mb-2" />
            <p className="text-xs font-medium text-[#18181B]">Chưa có sản phẩm nào</p>
            <p className="text-[11px] mt-0.5">
              Chọn mặt hàng hoặc gói tập từ danh mục bên trái để đưa vào hóa đơn.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <PosCartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {/* Payment Method Selector */}
      <div className="pt-3 border-t border-[#E4E4E0]">
        <label className="text-[11px] font-semibold text-[#6E6E77] uppercase tracking-wider block mb-2">
          Phương Thức Thanh Toán
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => setPaymentMethod('CASH')}
            className={`py-2 px-1 rounded-xl text-[11px] font-semibold border flex flex-col items-center gap-1 transition ${
              paymentMethod === 'CASH'
                ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                : 'bg-[#F7F7F5] text-[#6E6E77] border-[#E4E4E0] hover:text-[#18181B]'
            }`}
          >
            <Banknote size={15} />
            Tiền Mặt
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('TRANSFER')}
            className={`py-2 px-1 rounded-xl text-[11px] font-semibold border flex flex-col items-center gap-1 transition ${
              paymentMethod === 'TRANSFER'
                ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                : 'bg-[#F7F7F5] text-[#6E6E77] border-[#E4E4E0] hover:text-[#18181B]'
            }`}
          >
            <QrCode size={15} />
            Chuyển Khoản
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('MOMO')}
            className={`py-2 px-1 rounded-xl text-[11px] font-semibold border flex flex-col items-center gap-1 transition ${
              paymentMethod === 'MOMO'
                ? 'bg-[#A50064] text-white border-[#A50064] shadow-xs'
                : 'bg-[#F7F7F5] text-[#6E6E77] border-[#E4E4E0] hover:text-[#18181B]'
            }`}
          >
            <span className="font-bold text-[10px] uppercase">MoMo</span>
            Ví MoMo
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('CARD')}
            className={`py-2 px-1 rounded-xl text-[11px] font-semibold border flex flex-col items-center gap-1 transition ${
              paymentMethod === 'CARD'
                ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                : 'bg-[#F7F7F5] text-[#6E6E77] border-[#E4E4E0] hover:text-[#18181B]'
            }`}
          >
            <CreditCard size={15} />
            Thẻ POS
          </button>
        </div>
      </div>

      {/* Total & Checkout */}
      <div className="pt-4 mt-3 border-t border-[#E4E4E0] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6E6E77] font-medium">Tổng tiền thanh toán:</span>
          <span className="font-mono font-extrabold text-xl text-[#18181B]">
            {formatVND(totalAmount)}
          </span>
        </div>

        <button
          onClick={() => onCheckout(paymentMethod)}
          disabled={cart.length === 0 || isSubmitting}
          className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Đang Chốt Đơn...
            </>
          ) : (
            <>
              Xác Nhận & Xuất Hóa Đơn
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
