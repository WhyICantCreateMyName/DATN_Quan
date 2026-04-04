'use client';

import { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import { Briefcase, ShieldAlert, BadgeCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function StaffPage() {
  const { showToast } = useToast();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ phone: '', fullName: '', password: 'admin', role: 'RECEPTIONIST' });

  const fetchStaff = async (currentPage: number) => {
    try {
      setLoading(true);
      const res: any = await axiosClient.get(`/users?role=STAFF&page=${currentPage}&limit=12`);
      setStaffList(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff(page);
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post('/users', form);
      showToast('Đã cấp tài khoản Nội bộ thành công!', 'success');
      setShowModal(false);
      setForm({ ...form, phone: '', fullName: '' });
      fetchStaff(page);
    } catch (error: any) {
      showToast('Lỗi tạo user: ' + error.message, 'error');
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
             <Briefcase className="w-8 h-8 text-yellow-500" /> Quản Lý <span className="text-yellow-500">Nhân Sự</span>
          </h1>
          <p className="text-gray-400">Ban Quản Trị, Lễ Tân và Huấn luyện viên.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white transition-colors"
        >
          Cấp Mới Dịch Thuật
        </button>
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-3xl overflow-y-auto p-6 flex flex-col">
        <div className="grid grid-cols-3 gap-6 flex-1 content-start">
          {loading ? (
             <p className="text-gray-500 col-span-3">Đang Load...</p>
          ) : staffList.length === 0 ? (
             <p className="text-gray-500 col-span-3">Chưa có Nhân sự nào.</p>
          ) : (
            staffList.map(s => (
              <div key={s.id} className="relative bg-gray-800/50 border border-gray-800 rounded-2xl p-6 group hover:border-yellow-500/50 transition h-48">
                <div className="absolute top-4 right-4 bg-gray-900 text-xs font-bold px-3 py-1 rounded-full border border-gray-700 uppercase">
                  {s.role}
                </div>
                
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-full flex items-center justify-center mb-4">
                  {s.role === 'ADMIN' ? <ShieldAlert className="w-8 h-8 text-red-500"/> : <BadgeCheck className="w-8 h-8 text-yellow-500"/>}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 truncate">{s.fullName}</h3>
                <p className="text-gray-400 text-sm">{s.phone}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-800 text-sm text-gray-400">
           <span>Trang {page} / {meta.totalPages}</span>
           <div className="flex gap-2">
             <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white transition">Trước</button>
             <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white transition">Sau</button>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-3xl">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-[400px]">
            <h2 className="text-xl font-bold mb-6 text-yellow-500">Khai Báo Nhân Sự Cấp Cao</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Vai Trò (Role)</label>
                <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl text-white outline-none focus:ring-1 focus:ring-yellow-500">
                   <option value="ADMIN">Giám đốc (ADMIN)</option>
                   <option value="RECEPTIONIST">Lễ Tân (RECEPTIONIST)</option>
                   <option value="PT">Huấn luyện viên (PT)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Họ Tên</label>
                <input type="text" required value={form.fullName} onChange={e=>setForm({...form, fullName: e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl text-white outline-none focus:ring-1 focus:ring-yellow-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">SĐT (Tài khoản)</label>
                <input type="text" required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl text-white outline-none focus:ring-1 focus:ring-yellow-500" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 py-3 rounded-xl hover:bg-gray-700">Hủy</button>
                <button type="submit" className="flex-1 bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-white transition-colors">Cấp Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
