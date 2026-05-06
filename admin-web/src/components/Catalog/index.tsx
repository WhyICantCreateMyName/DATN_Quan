'use client';

import { useState } from 'react';
import { 
  Package, Trash2, PlusCircle, Tag, Users, Calendar, 
  Activity, ChevronRight, Edit2, Camera, Database, Dumbbell 
} from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { formatVND } from '@/libs/utils';
import { uploadService } from '@/services/uploadService';

export default function Catalog() {
  const { 
    plans, classes, products, loading, deleteItem,
    refreshPlans, refreshClasses, refreshProducts,
    createPlan, updatePlan, createProduct, updateProduct, createClass, updateClass 
  } = useCatalog();

  const [activeTab, setActiveTab] = useState<'plans' | 'classes' | 'products'>('plans');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form States
  const [planForm, setPlanForm] = useState({ name: '', price: 0, durationDays: 30, ptSessions: 0, description: '', tag: '' });
  const [classForm, setClassForm] = useState({ name: '', capacity: 20, startTime: '', endTime: '' });
  const [prodForm, setProdForm] = useState({ name: '', price: 0, stock: 100, imageUrl: '' });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'plans') {
        if (editingId) await updatePlan(editingId, planForm);
        else await createPlan(planForm);
        refreshPlans();
      } else if (activeTab === 'classes') {
        const data = {
          ...classForm,
          startTime: new Date(classForm.startTime),
          endTime: new Date(classForm.endTime)
        };
        if (editingId) await updateClass(editingId, data);
        else await createClass(data);
        refreshClasses();
      } else {
        if (editingId) await updateProduct(editingId, prodForm);
        else await createProduct(prodForm);
        refreshProducts();
      }
      setShowModal(false);
      setEditingId(null);
    } catch (error) {
      alert('Lỗi khi lưu dữ liệu');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setPlanForm({ name: '', price: 0, durationDays: 30, ptSessions: 0, description: '', tag: '' });
    setClassForm({ name: '', capacity: 20, startTime: '', endTime: '' });
    setProdForm({ name: '', price: 0, stock: 100, imageUrl: '' });
    setShowModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header đồng bộ với Staff/POS */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight italic">
            Quản Lý <span className="text-[#39FF14]">Danh Mục</span>
          </h1>
          <p className="text-gray-400 mt-1">Thiết lập hệ sinh thái dịch vụ, lớp học và sản phẩm của TitanGym.</p>
        </div>
        
        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
           <button onClick={()=>setActiveTab('plans')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'plans' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}>Gói Tập</button>
           <button onClick={()=>setActiveTab('classes')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'classes' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}>Lớp Học</button>
           <button onClick={()=>setActiveTab('products')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'products' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}>Sản Phẩm</button>
        </div>
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden flex flex-col relative">
        <div className="p-8 flex justify-between items-center border-b border-gray-800 bg-gray-800/20">
           <h3 className="text-xl font-bold flex items-center gap-2">
             {activeTab === 'plans' && <><Tag className="text-[#39FF14]"/> Danh sách Gói tập</>}
             {activeTab === 'classes' && <><Calendar className="text-[#39FF14]"/> Lịch Lớp học Group X</>}
             {activeTab === 'products' && <><Package className="text-[#39FF14]"/> Kho hàng & Sản phẩm lẻ</>}
           </h3>
           <button 
             onClick={openAddModal}
             className="bg-[#39FF14] text-black font-black px-6 py-2 rounded-xl text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]"
           >
             <PlusCircle size={18}/> THÊM MỚI
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
           {loading && <div className="h-full flex items-center justify-center text-gray-500 animate-pulse">Đang đồng bộ dữ liệu...</div>}
           
           {!loading && activeTab === 'plans' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {plans?.data.map((p) => (
                 <div key={p.id} className="bg-gray-800/40 border border-gray-700 p-6 rounded-[2rem] hover:border-[#39FF14]/50 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setPlanForm({ name: p.name, price: p.price, durationDays: p.durationDays, ptSessions: p.ptSessions, description: p.description || '', tag: p.tag || '' });
                          setEditingId(p.id);
                          setShowModal(true);
                        }}
                        className="bg-gray-900 p-2 rounded-lg text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition"
                      >
                        <Edit2 size={16}/>
                      </button>
                      <button onClick={() => deleteItem('plan', p.id)} className="bg-gray-900 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition">
                        <Trash2 size={16}/>
                      </button>
                   </div>
                   <div className="p-4 bg-[#39FF14]/10 rounded-2xl text-[#39FF14] w-fit mb-6">
                     <Tag size={32} />
                   </div>
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-2xl font-black text-white uppercase tracking-tight">{p.name}</h3>
                       {p.tag && (
                         <span className="px-3 py-1 bg-gray-900 border border-gray-700 text-[#39FF14] text-[10px] font-black rounded-lg">
                           {p.tag === 'GOLD' ? 'GOLD' : p.tag === 'DIAMOND' ? 'DIAMOND' : p.tag === 'PT_ADDON' ? 'PT ADD-ON' : p.tag}
                         </span>
                       )}
                    </div>
                   <p className="text-gray-400 text-sm mb-8 line-clamp-2 min-h-[40px]">{p.description || 'Hệ thống chưa cập nhật mô tả cho gói này.'}</p>
                   <div className="flex justify-between items-end border-t border-gray-700 pt-6">
                      {p.tag !== 'PT_ADDON' && (
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Thời hạn tập</p>
                          <p className="text-white font-bold text-lg">{p.durationDays} ngày</p>
                        </div>
                      )}
                      {p.ptSessions > 0 && (
                        <div className={p.tag === 'PT_ADDON' ? 'text-left' : 'text-center'}>
                           <p className="text-[10px] text-[#39FF14] uppercase font-black tracking-widest mb-1">
                              {p.tag === 'PT_ADDON' ? 'Số buổi PT' : 'PT Kèm'}
                           </p>
                           <p className="text-white font-bold text-lg flex items-center gap-1 justify-center">
                              <Dumbbell size={14} className="text-[#39FF14]"/> {p.ptSessions} buổi
                           </p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-[#39FF14] text-3xl font-black italic">{formatVND(p.price)}</p>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
           )}

           {!loading && activeTab === 'classes' && (
              <div className="bg-gray-800/30 rounded-3xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-800/50">
                    <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="p-6">Lớp học</th>
                      <th className="p-6">Thời gian</th>
                      <th className="p-6">Sĩ số</th>
                      <th className="p-6">Trạng thái</th>
                      <th className="p-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {classes?.data.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-800/20 transition-colors group">
                        <td className="p-6 font-bold text-white text-lg">{c.name}</td>
                        <td className="p-6 text-gray-300 font-mono">
                          {new Date(c.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(c.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-6 text-white font-bold"><Users size={16} className="inline mr-2 text-gray-500"/> {c.capacity}</td>
                        <td className="p-6">
                          <span className="px-4 py-1 bg-[#39FF14]/10 text-[#39FF14] rounded-full text-[10px] font-black uppercase">Sắp diễn ra</span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setClassForm({ 
                                  name: c.name, 
                                  capacity: c.capacity, 
                                  startTime: new Date(c.startTime).toISOString().slice(0, 16), 
                                  endTime: new Date(c.endTime).toISOString().slice(0, 16) 
                                });
                                setEditingId(c.id);
                                setShowModal(true);
                              }}
                              className="p-2 text-gray-500 hover:text-[#39FF14] transition"
                            >
                              <Edit2 size={16}/>
                            </button>
                            <button onClick={() => deleteItem('class', c.id)} className="p-2 text-gray-500 hover:text-red-500 transition">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           )}

           {!loading && activeTab === 'products' && (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
               {products?.data.map((p) => (
                 <div key={p.id} className="bg-gray-800/40 border border-gray-700 p-5 rounded-[2rem] flex flex-col items-center group relative hover:border-[#39FF14]/50 transition-all">
                   <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button 
                        onClick={() => {
                          setProdForm({ name: p.name, price: p.price, stock: p.stock, imageUrl: p.imageUrl || '' });
                          setEditingId(p.id);
                          setShowModal(true);
                        }}
                        className="bg-gray-900 p-2 rounded-lg text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteItem('prod', p.id)} className="bg-gray-900 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition">
                        <Trash2 size={14} />
                      </button>
                   </div>
                   <div className="w-full aspect-square bg-gray-900 rounded-3xl mb-6 flex items-center justify-center text-gray-700 group-hover:text-[#39FF14] transition-colors overflow-hidden border border-gray-800">
                     {p.imageUrl ? (
                       <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     ) : (
                       <Package size={64} />
                     )}
                   </div>
                   <h4 className="text-white font-bold text-center mb-1 text-lg line-clamp-1">{p.name}</h4>
                   <p className="text-[#39FF14] font-black text-xl mb-4 italic">{formatVND(p.price)}</p>
                   <div className="w-full bg-gray-900/50 p-2 rounded-xl flex justify-center">
                     <span className="text-[10px] text-gray-500 uppercase font-black">Tồn kho: {p.stock}</span>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* MODAL đồng bộ phong cách TitanGym */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-xl rounded-[3rem] p-10 relative shadow-[0_0_80px_rgba(57,255,20,0.15)] max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h2 className="text-3xl font-black uppercase italic mb-8 flex items-center gap-4">
              {editingId ? <Edit2 className="text-[#39FF14] w-8 h-8"/> : <PlusCircle className="text-[#39FF14] w-8 h-8"/>}
              {editingId ? 'Cập nhật' : 'Thêm mới'} <span className="text-[#39FF14]">{activeTab === 'plans' ? 'Gói Tập' : activeTab === 'classes' ? 'Lớp Học' : 'Sản Phẩm'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'plans' && (
                <>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Tên định danh gói tập</label>
                        <input required value={planForm.name} className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white font-bold transition-all outline-none" placeholder="VD: Gói Gym 1 Tháng" onChange={e => setPlanForm({ ...planForm, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Loại Gói Dịch Vụ</label>
                        <select 
                          value={planForm.tag} 
                          className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white font-bold outline-none appearance-none cursor-pointer"
                          onChange={e => setPlanForm({ ...planForm, tag: e.target.value })}
                        >
                          <option value="">Chọn loại gói...</option>
                          <option value="GOLD">Hội viên Vàng (Gold)</option>
                          <option value="DIAMOND">Hội viên Kim cương (Diamond)</option>
                          <option value="PT_ADDON">Gói Bổ sung buổi PT (Add-on)</option>
                        </select>
                      </div>
                   </div>
                  <div className={`grid ${planForm.tag === 'PT_ADDON' ? 'grid-cols-2' : 'grid-cols-3'} gap-6`}>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Giá niêm yết (VNĐ)</label><input type="number" value={planForm.price} required className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white font-mono" onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })} /></div>
                    
                    {planForm.tag !== 'PT_ADDON' && (
                      <div><label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Thời hạn tập (Ngày)</label><input type="number" value={planForm.durationDays} className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white" onChange={e => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })} /></div>
                    )}
                    
                    <div><label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Số buổi PT {planForm.tag === 'PT_ADDON' ? 'mua thêm' : 'tặng kèm'}</label><input type="number" value={planForm.ptSessions} className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white" onChange={e => setPlanForm({ ...planForm, ptSessions: Number(e.target.value) })} /></div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Mô tả dịch vụ</label>
                    <textarea value={planForm.description} rows={3} className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white resize-none" onChange={e => setPlanForm({ ...planForm, description: e.target.value })} />
                  </div>
                </>
              )}

              {activeTab === 'classes' && (
                <>
                  <div><label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Tên Lớp (Yoga, Zumba...)</label><input required value={classForm.name} className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white font-bold transition-all outline-none" onChange={e => setClassForm({ ...classForm, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Giờ Bắt Đầu</label><input type="datetime-local" required value={classForm.startTime} className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white" onChange={e => setClassForm({ ...classForm, startTime: e.target.value })} /></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Giờ Kết Thúc</label><input type="datetime-local" required value={classForm.endTime} className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white" onChange={e => setClassForm({ ...classForm, endTime: e.target.value })} /></div>
                  </div>
                  <div><label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Sĩ Số Tối Đa</label><input type="number" required value={classForm.capacity} className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white" onChange={e => setClassForm({ ...classForm, capacity: Number(e.target.value) })} /></div>
                </>
              )}

              {activeTab === 'products' && (
                <>
                  <div className="flex gap-6 items-center bg-gray-800/50 p-6 rounded-[2.5rem] border border-gray-700">
                    <div className="w-24 h-24 rounded-3xl bg-gray-900 flex items-center justify-center overflow-hidden border-2 border-[#39FF14]/30">
                      {prodForm.imageUrl ? <img src={prodForm.imageUrl} className="w-full h-full object-cover" /> : <Package size={32} className="text-gray-700" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Ảnh Chân Thực Sản Phẩm</p>
                      <input 
                        type="file" accept="image/*" className="hidden" id="p-img-upload" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploading(true);
                            try { const res = await uploadService.uploadFile(file); setProdForm({ ...prodForm, imageUrl: res.url }); }
                            finally { setUploading(false); }
                          }
                        }}
                      />
                      <label htmlFor="p-img-upload" className="bg-[#39FF14] text-black text-[10px] font-black px-5 py-3 rounded-xl cursor-pointer uppercase transition hover:bg-white shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                        {uploading ? 'Đang tải...' : 'Tải Ảnh Mới'}
                      </label>
                    </div>
                  </div>
                  <div><label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Tên Hàng Hóa</label><input required value={prodForm.name} className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white font-bold transition-all outline-none" onChange={e => setProdForm({ ...prodForm, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Giá Bán Lẻ (VNĐ)</label><input type="number" value={prodForm.price} required className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white font-mono" onChange={e => setProdForm({ ...prodForm, price: Number(e.target.value) })} /></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Tồn Kho Hiện Tại</label><input type="number" value={prodForm.stock} required className="w-full bg-gray-800 border-gray-700 focus:border-[#39FF14] rounded-2xl p-5 text-white" onChange={e => setProdForm({ ...prodForm, stock: Number(e.target.value) })} /></div>
                  </div>
                </>
              )}

              <div className="flex gap-4 mt-12">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="flex-1 bg-gray-800 text-white font-black p-5 rounded-2xl hover:bg-gray-700 transition tracking-widest uppercase">HỦY BỎ</button>
                <button type="submit" disabled={uploading} className="flex-2 bg-[#39FF14] text-black font-black p-5 rounded-2xl hover:bg-white transition uppercase tracking-widest disabled:opacity-50 shadow-[0_0_30px_rgba(57,255,20,0.4)]">
                   {editingId ? 'Cập Nhật Thay Đổi' : 'Xác Nhận Lưu Lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
