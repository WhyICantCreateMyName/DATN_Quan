'use client';

import { useState } from 'react';
import { ShoppingCart, Trash2, CreditCard, Banknote, ChevronLeft, ChevronRight, Search, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePOS } from '@/hooks/usePOS';
import { formatVND } from '@/libs/utils';

export default function POS() {
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const { 
    items, cart, lockedMember, pagination, setPage, 
    lookupMember, setLockedMember, addToCart, removeFromCart, checkout, total 
  } = usePOS();
  
  const [phoneSearch, setPhoneSearch] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneSearch) return;
    try {
      const member = await lookupMember(phoneSearch);
      showToast('Đã khóa mục tiêu khách hàng: ' + member.name, 'success');
    } catch (e) {
      showToast('Không tìm thấy Hội viên với SĐT trùng khớp!', 'error');
      setLockedMember(null);
    }
  };

  const handleCheckout = async (method: string) => {
    if (!currentUser) return;
    try {
      await checkout(currentUser.id, method);
      showToast('Thanh toán thành công! Nếu có mua Gói tập thì Thẻ đã kích hoạt ngay!', 'success');
      setPhoneSearch('');
    } catch (error: any) { 
      showToast('Thanh toán lỗi: ' + error.message, 'error'); 
    }
  };

  return (
    <div className="flex h-full gap-6 relative">
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Máy Tính Tiền <span className="text-[#39FF14]">(POS)</span></h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1">
             <button disabled={pagination.page<=1} onClick={() => setPage(pagination.page-1)} className="p-2 hover:bg-gray-800 disabled:opacity-30 rounded-lg text-white"><ChevronLeft className="w-5 h-5"/></button>
             <span className="text-sm font-bold w-20 text-center">Trang {pagination.page}/{pagination.totalPages}</span>
             <button disabled={pagination.page>=pagination.totalPages} onClick={() => setPage(pagination.page+1)} className="p-2 hover:bg-gray-800 disabled:opacity-30 rounded-lg text-[#39FF14]"><ChevronRight className="w-5 h-5"/></button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 overflow-y-auto pb-4">
          {items.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl hover:border-[#39FF14] transition-all text-left group flex flex-col h-48">
              <div className="flex justify-between items-start w-full mb-auto">
                <div className={`rounded-lg overflow-hidden ${p.type === 'membership' ? 'bg-[#39FF14]/10 text-[#39FF14] p-2' : 'w-full h-16 bg-gray-800'} flex items-center justify-center`}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <p.icon className="w-6 h-6" />
                  )}
                </div>
                <p className="text-[#39FF14] font-bold opacity-0 group-hover:opacity-100 transition-opacity">+</p>
              </div>
              <div>
                <p className="font-bold text-white leading-tight text-sm truncate">{p.name}</p>
                <p className="text-gray-400 text-xs mt-1">{formatVND(p.price)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-[400px] bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col h-[calc(100vh-80px)]">
         <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-gray-800 pb-4"><ShoppingCart className="w-5 h-5 text-[#39FF14]" /> Đơn Hàng Lễ Tân</h2>
         
         {!lockedMember ? (
           <form onSubmit={handleSearch} className="mb-4 relative">
             <input type="text" placeholder="Tìm bằng SĐT khách..." value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} className="px-4 py-3 bg-gray-800 rounded-xl text-white text-sm outline-none w-full pl-10"/>
             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5"/>
             <button type="submit" className="hidden"></button>
           </form>
         ) : (
           <div className="mb-4 bg-blue-500/10 border border-blue-500/50 p-3 rounded-xl flex items-center justify-between">
              <div>
                 <p className="text-xs text-blue-400 font-bold uppercase flex items-center gap-1"><Lock className="w-3 h-3"/> Đã Khóa Mục Tiêu</p>
                 <p className="font-bold text-white mt-1">{lockedMember.name}</p>
              </div>
              <button onClick={()=>{setLockedMember(null); setPhoneSearch('');}} className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-gray-300 transition">Hủy</button>
           </div>
         )}
         
         <div className="flex-1 overflow-y-auto space-y-3 mb-4">
           {cart.length === 0 && <p className="text-center text-gray-500 mt-10">Bấm sản phẩm để chốt đơn</p>}
           {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-gray-800">
                <div className="flex-1 w-40">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  <p className="text-[#39FF14] text-xs">{formatVND(item.price * item.qty)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-5 text-center">x{item.qty}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
         </div>

         <div className="border-t border-gray-800 pt-4">
           <div className="flex justify-between items-center mb-4"><p className="text-gray-400">Tổng V.A.T</p><p className="text-2xl font-black text-[#39FF14]">{formatVND(total)}</p></div>
           <div className="grid grid-cols-2 gap-3">
             <button disabled={cart.length===0} onClick={()=>handleCheckout('CASH')} className="bg-gray-800 text-white font-bold py-4 rounded-xl disabled:opacity-50"><Banknote className="w-4 h-4 inline mr-2"/>Tiền Mặt</button>
             <button disabled={cart.length===0} onClick={()=>handleCheckout('TRANSFER')} className="bg-[#39FF14] text-black font-bold py-4 rounded-xl disabled:opacity-50"><CreditCard className="w-4 h-4 inline mr-2"/>Pos / Bank</button>
           </div>
         </div>
      </div>
    </div>
  );
}
