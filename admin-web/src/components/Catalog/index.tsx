'use client';

import { useState } from 'react';
import { 
  Package, Trash2, PlusCircle, Tag, Users, Calendar, 
  ChevronRight, Edit2, Camera, Dumbbell, Layers 
} from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { formatVND } from '@/libs/utils';
import { uploadService } from '@/services/uploadService';
import Pagination from '../Pagination';
import PlanTable from './Plans/PlanTable';

export default function Catalog() {
  const { 
    classes, products, loading, deleteItem,
    refreshClasses, refreshProducts,
    createProduct, updateProduct, createClass, updateClass 
  } = useCatalog();

  const [activeTab, setActiveTab] = useState<'plans' | 'classes' | 'products'>('plans');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Form States for classes & products
  const [classForm, setClassForm] = useState({ name: '', capacity: 20, startTime: '', endTime: '' });
  const [prodForm, setProdForm] = useState({ name: '', price: 0, stock: 100, imageUrl: '' });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'classes') {
        const data = {
          ...classForm,
          startTime: new Date(classForm.startTime),
          endTime: new Date(classForm.endTime)
        };
        if (editingId) await updateClass(editingId, data);
        else await createClass(data);
        refreshClasses(page);
      } else if (activeTab === 'products') {
        if (editingId) await updateProduct(editingId, prodForm);
        else await createProduct(prodForm);
        refreshProducts(page);
      }
      setShowModal(false);
      setEditingId(null);
    } catch (error) {
      alert('Lỗi khi lưu dữ liệu');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setClassForm({ name: '', capacity: 20, startTime: '', endTime: '' });
    setProdForm({ name: '', price: 0, stock: 100, imageUrl: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E4E4E0] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#18181B]">
            Quản Lý Danh Mục Dịch Vụ
          </h1>
          <p className="text-sm text-[#6E6E77] mt-1">
            Thiết lập hệ sinh thái gói tập hội viên, lớp học nhóm và sản phẩm bán lẻ TitanGym
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex p-1 bg-[#F7F7F5] rounded-xl border border-[#E4E4E0]">
          <button
            onClick={() => { setActiveTab('plans'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'plans'
                ? 'bg-[#FFFFFF] text-[#EA580C] shadow-sm border border-[#E4E4E0]'
                : 'text-[#6E6E77] hover:text-[#18181B]'
            }`}
          >
            <Tag size={14} />
            Gói Tập & Thẻ Hội Viên
          </button>
          <button
            onClick={() => { setActiveTab('classes'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'classes'
                ? 'bg-[#FFFFFF] text-[#EA580C] shadow-sm border border-[#E4E4E0]'
                : 'text-[#6E6E77] hover:text-[#18181B]'
            }`}
          >
            <Calendar size={14} />
            Lớp Học GroupX
          </button>
          <button
            onClick={() => { setActiveTab('products'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-[#FFFFFF] text-[#EA580C] shadow-sm border border-[#E4E4E0]'
                : 'text-[#6E6E77] hover:text-[#18181B]'
            }`}
          >
            <Package size={14} />
            Sản Phẩm & Phụ Kiện
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'plans' && (
        <PlanTable />
      )}

      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="text-[#EA580C]" size={20} />
              <h2 className="text-base font-bold text-[#18181B]">Lịch Lớp Học GroupX</h2>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
            >
              <PlusCircle size={16} /> Thêm Lớp Mới
            </button>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F7F7F5] border-b border-[#E4E4E0] text-[11px] font-semibold text-[#6E6E77] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tên Lớp Học</th>
                  <th className="py-3 px-4">Khung Giờ</th>
                  <th className="py-3 px-4">Sĩ Số</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E0]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-[#6E6E77]">
                      Đang tải danh sách lớp học...
                    </td>
                  </tr>
                ) : classes?.data.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F7F5]/60 transition">
                    <td className="py-3 px-4 font-semibold text-sm text-[#18181B]">{c.name}</td>
                    <td className="py-3 px-4 text-sm font-mono text-[#6E6E77]">
                      {new Date(c.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(c.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#18181B]">
                      <Users size={14} className="inline mr-1 text-[#6E6E77]" /> {c.capacity} người
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#15803D]/10 text-[#15803D]">
                        Sắp diễn ra
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
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
                          className="p-1.5 text-[#6E6E77] hover:text-[#18181B] rounded-lg hover:bg-[#F7F7F5]"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => deleteItem('class', c.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="text-[#EA580C]" size={20} />
              <h2 className="text-base font-bold text-[#18181B]">Kho Hàng & Sản Phẩm Lẻ</h2>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
            >
              <PlusCircle size={16} /> Thêm Sản Phẩm Mới
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products?.data.map((p) => (
              <div key={p.id} className="bg-[#FFFFFF] border border-[#E4E4E0] p-4 rounded-2xl shadow-sm hover:border-[#EA580C]/40 transition group relative">
                <div className="w-full aspect-square bg-[#F7F7F5] rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-[#E4E4E0]">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <Package size={36} className="text-[#6E6E77]" />
                  )}
                </div>
                <h4 className="font-semibold text-sm text-[#18181B] truncate">{p.name}</h4>
                <p className="text-sm font-mono font-bold text-[#EA580C] mt-1">{formatVND(p.price)}</p>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#E4E4E0] text-xs text-[#6E6E77]">
                  <span>Kho: {p.stock}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setProdForm({ name: p.name, price: p.price, stock: p.stock, imageUrl: p.imageUrl || '' });
                        setEditingId(p.id);
                        setShowModal(true);
                      }}
                      className="p-1 text-[#6E6E77] hover:text-[#18181B]"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => deleteItem('prod', p.id)} className="p-1 text-rose-500 hover:text-rose-700">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Class / Product */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E4E4E0] w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#18181B] mb-4">
              {editingId ? 'Cập Nhật' : 'Thêm Mới'} {activeTab === 'classes' ? 'Lớp Học' : 'Sản Phẩm'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'classes' && (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase text-[#6E6E77] block mb-1">Tên Lớp</label>
                    <input required value={classForm.name} className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3 py-2 text-sm text-[#18181B] outline-none focus:border-[#EA580C]" onChange={e => setClassForm({ ...classForm, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase text-[#6E6E77] block mb-1">Bắt Đầu</label>
                      <input type="datetime-local" required value={classForm.startTime} className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-2 py-2 text-xs text-[#18181B] outline-none" onChange={e => setClassForm({ ...classForm, startTime: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-[#6E6E77] block mb-1">Kết Thúc</label>
                      <input type="datetime-local" required value={classForm.endTime} className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-2 py-2 text-xs text-[#18181B] outline-none" onChange={e => setClassForm({ ...classForm, endTime: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-[#6E6E77] block mb-1">Sĩ Số Tối Đa</label>
                    <input type="number" required value={classForm.capacity} className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3 py-2 text-sm text-[#18181B] outline-none" onChange={e => setClassForm({ ...classForm, capacity: Number(e.target.value) })} />
                  </div>
                </>
              )}

              {activeTab === 'products' && (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase text-[#6E6E77] block mb-1">Tên Sản Phẩm</label>
                    <input required value={prodForm.name} className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3 py-2 text-sm text-[#18181B] outline-none focus:border-[#EA580C]" onChange={e => setProdForm({ ...prodForm, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase text-[#6E6E77] block mb-1">Giá Bán (VNĐ)</label>
                      <input type="number" required value={prodForm.price} className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3 py-2 text-sm font-mono text-[#18181B] outline-none" onChange={e => setProdForm({ ...prodForm, price: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-[#6E6E77] block mb-1">Tồn Kho</label>
                      <input type="number" required value={prodForm.stock} className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3 py-2 text-sm font-mono text-[#18181B] outline-none" onChange={e => setProdForm({ ...prodForm, stock: Number(e.target.value) })} />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E4E0]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-[#6E6E77] hover:bg-[#F7F7F5] rounded-xl">Hủy</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
