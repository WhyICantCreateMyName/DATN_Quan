'use client';

import { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import { Package, Trash2, PlusCircle, Tag, Dumbbell } from 'lucide-react';

export default function InventoryPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Tái chế code cũ, update mỗi prodsRes.data
  const fetchData = async () => {
    try {
      const plansRes = await axiosClient.get('/memberships/plans');
      // Limit cao xíu để lấy đủ trong Kho
      const prodsRes: any = await axiosClient.get('/pos/products?limit=50');
      setPlans(plansRes as any);
      setProducts(prodsRes.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);
  // ... bỏ qua các form state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);
  const [planForm, setPlanForm] = useState({ name: '', price: 0, durationDays: 30, ptSessions: 0 });
  const [prodForm, setProdForm] = useState({ name: '', price: 0, stock: 100 });

  const handleCreatePlan = async (e: any) => { e.preventDefault(); await axiosClient.post('/memberships/plans', planForm); setShowPlanModal(false); fetchData(); };
  const handleCreateProd = async (e: any) => { e.preventDefault(); await axiosClient.post('/pos/products', prodForm); setShowProdModal(false); fetchData(); };
  const handleDelete = async (type: string, id: number) => { 
    if(!confirm('Xóa?')) return;
    try {
       if(type==='plan') await axiosClient.delete('/memberships/plans/'+id);
       else await axiosClient.delete('/pos/products/'+id);
       fetchData();
    } catch(e){}
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Cơ Sở <span className="text-[#39FF14]">Dữ Liệu Hàng Hóa</span></h1>
          <p className="text-gray-400">Định nghĩa Gói tập và Sản phẩm bán lẻ xuất hiện trên hệ thống Lễ tân.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col h-full">
           <div className="flex justify-between mb-6"><h2 className="text-xl font-bold flex items-center gap-2"><Tag className="text-[#39FF14]"/> Gói Tập (Dịch Vụ)</h2><button onClick={()=>setShowPlanModal(true)} className="text-[#39FF14]"><PlusCircle/></button></div>
           <div className="flex-1 overflow-y-auto space-y-3">
              {plans.map(p => (
                 <div key={p.id} className="bg-gray-800/50 p-4 rounded-xl flex justify-between items-center">
                    <div><p className="font-bold text-white">{p.name}</p><p className="text-sm text-gray-400">Hạn: {p.durationDays} ng</p></div>
                    <div className="flex gap-4 items-center"><span className="text-[#39FF14] font-bold">{p.price.toLocaleString()}đ</span> <Trash2 className="w-4 cursor-pointer text-gray-500 hover:text-red-500" onClick={()=>handleDelete('plan', p.id)}/> </div>
                 </div>
              ))}
           </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col h-full">
           <div className="flex justify-between mb-6"><h2 className="text-xl font-bold flex items-center gap-2"><Package className="text-blue-500"/> Mặt Hàng Bán Lẻ (Kho)</h2><button onClick={()=>setShowProdModal(true)} className="text-blue-500"><PlusCircle/></button></div>
           <div className="flex-1 overflow-y-auto space-y-3">
              {products.map(p => (
                 <div key={p.id} className="bg-gray-800/50 p-4 rounded-xl flex justify-between items-center">
                    <div><p className="font-bold text-white">{p.name}</p><p className="text-sm text-gray-400">Kho: {p.stock}</p></div>
                    <div className="flex gap-4 items-center"><span className="text-blue-400 font-bold">{p.price.toLocaleString()}đ</span> <Trash2 className="w-4 cursor-pointer text-gray-500 hover:text-red-500" onClick={()=>handleDelete('prod', p.id)}/> </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

     {/* Modals similar to old code */}
     {showPlanModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl w-[400px]">
             <h2 className="mb-4 font-bold text-xl">Thêm Gói</h2>
             <form onSubmit={handleCreatePlan} className="space-y-3">
               <input placeholder="Tên Gói" required className="w-full p-2 bg-gray-800 text-white rounded-lg" onChange={e=>setPlanForm({...planForm, name: e.target.value})}/>
               <input placeholder="Giá" type="number" required className="w-full p-2 bg-gray-800 text-white rounded-lg" onChange={e=>setPlanForm({...planForm, price: Number(e.target.value)})}/>
               <button className="w-full bg-[#39FF14] text-black font-bold p-3 rounded-lg">Lưu</button>
             </form>
          </div>
        </div>
     )}
     {showProdModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl w-[400px]">
             <h2 className="mb-4 font-bold text-xl">Thêm Hàng</h2>
             <form onSubmit={handleCreateProd} className="space-y-3">
               <input placeholder="Tên Hàng" required className="w-full p-2 bg-gray-800 text-white rounded-lg" onChange={e=>setProdForm({...prodForm, name: e.target.value})}/>
               <input placeholder="Giá" type="number" required className="w-full p-2 bg-gray-800 text-white rounded-lg" onChange={e=>setProdForm({...prodForm, price: Number(e.target.value)})}/>
               <input placeholder="Số lượng kho" type="number" required className="w-full p-2 bg-gray-800 text-white rounded-lg" onChange={e=>setProdForm({...prodForm, stock: Number(e.target.value)})}/>
               <button className="w-full bg-blue-500 text-white font-bold p-3 rounded-lg">Lưu</button>
             </form>
          </div>
        </div>
     )}

    </div>
  );
}
