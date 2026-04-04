'use client';

import { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import { Users, Search, PlusCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function MembersPage() {
  const { showToast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ phone: '', fullName: '', password: '123' });

  const fetchUsers = async (currentPage: number) => {
    try {
      setLoading(true);
      const res: any = await axiosClient.get(`/users?role=MEMBER&page=${currentPage}&limit=10`);
      setMembers(res.data || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post('/users', {
        phone: form.phone,
        password: form.password,
        fullName: form.fullName,
        role: 'MEMBER'
      });
      showToast('Thêm thành công Hội Viên mới (Mật khẩu mặc định: 123)', 'success');
      setShowModal(false);
      setForm({ phone: '', fullName: '', password: '123' });
      fetchUsers(page);
    } catch (error: any) {
      showToast('Lỗi tạo user: ' + error.message, 'error');
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Hồ Sơ <span className="text-[#39FF14]">Hội Viên</span></h1>
          <p className="text-gray-400">Quản lý Khách Hàng, Gói Tập và Trạng Thái Thẻ.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#39FF14] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white transition-colors"
        >
          <PlusCircle className="w-5 h-5"/> Khởi Tạo Hồ Sơ
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr className="bg-gray-800/40 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium pl-6">ID Khách</th>
                <th className="p-4 font-medium">Họ Vền Tên</th>
                <th className="p-4 font-medium">Số Điện Thoại</th>
                <th className="p-4 font-medium">Gói Đang Tập</th>
                <th className="p-4 font-medium">Sinh Tồn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Đang tải Data...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Chưa có dòng dữ liệu Hội viên nào.</td></tr>
              ) : members.map((m) => {
                const activeSubs = m.memberProfile?.subscriptions?.filter((s: any) => s.status === 'ACTIVE') || [];
                const planName = activeSubs.length > 0 ? activeSubs[0].plan?.name : 'Vãng Lai';
                
                let chipColor = 'bg-gray-500/10 text-gray-500';
                let chipLabel = 'Chưa đăng ký';
                
                if (activeSubs.length > 0) {
                     const endD = new Date(activeSubs[0].endDate);
                     const now = new Date();
                     const remaining = Math.max(0, Math.ceil((endD.getTime() - now.getTime()) / (1000 * 3600 * 24)));
                     if (remaining > 0) {
                         chipColor = 'bg-[#39FF14]/10 text-[#39FF14]';
                         chipLabel = `Còn ${remaining} ngày`;
                     } else {
                         chipColor = 'bg-red-500/10 text-red-500';
                         chipLabel = 'Đã hết hạn';
                     }
                }

                return (
                  <tr key={m.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-4 pl-6 font-mono text-gray-500">HV_{m.id}</td>
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400 uppercase">
                        {m.fullName.charAt(0)}
                      </div>
                      {m.fullName}
                    </td>
                    <td className="p-4 text-gray-300">{m.phone}</td>
                    <td className="p-4 text-gray-300 font-medium">{planName}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full font-bold uppercase text-xs ${chipColor}`}>
                         {chipLabel}
                      </span>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>

        {/* Phân trang UI */}
        <div className="p-4 border-t border-gray-800 flex justify-between items-center text-sm text-gray-500 mt-auto bg-gray-900">
          Hiển thị trang {page} / {meta.totalPages} (Tổng cộng {meta.total} hồ sơ)
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border border-gray-800 rounded bg-gray-800 text-white disabled:opacity-50 transition-colors hover:bg-gray-700">Trước</button>
            <button disabled={page >= meta.totalPages} onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} className="px-4 py-2 border border-gray-800 rounded bg-gray-800 text-white disabled:opacity-50 transition-colors hover:bg-gray-700">Tiếp theo</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-[400px]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><PlusCircle className="text-[#39FF14] w-6 h-6"/> Thêm Hồ Sơ Mới</h2>
            <p className="text-gray-400 text-sm mb-4">Hồ sơ sẽ tự động được link với Cơ sở dữ liệu Cổng từ Check-in.</p>
            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                 <label className="block text-gray-400 text-sm mb-2">Họ & Tên Khách Mới *</label>
                 <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required className="w-full p-3 bg-gray-800 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#39FF14] text-white" />
              </div>
              <div>
                 <label className="block text-gray-400 text-sm mb-2">Số Điện Thoại *</label>
                 <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="w-full p-3 bg-gray-800 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#39FF14] text-white" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition">Hủy</button>
                <button type="submit" className="flex-1 bg-[#39FF14] text-black font-bold py-3 rounded-xl hover:bg-white transition">Lưu Thông Tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
