'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useMembers } from '@/hooks/useMembers';
import { userService } from '@/services/userService';
import { membershipService } from '@/services/membershipService';
import { uploadService } from '@/services/uploadService';
import { Snowflake, ArrowRightLeft, Camera, UserPlus } from 'lucide-react';

export default function Members() {
  const { showToast } = useToast();
  const { members, pagination, loading, setPage, createMember } = useMembers();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ phone: '', fullName: '', password: '123', avatarUrl: '' });
  const [uploading, setUploading] = useState(false);

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser = await createMember({
        phone: form.phone,
        password: form.password,
        fullName: form.fullName,
        role: 'MEMBER'
      });
      
      if (form.avatarUrl && newUser.id) {
        await userService.updateProfile(newUser.id, { avatarUrl: form.avatarUrl });
      }
      showToast('Thêm thành công Hội Viên mới (Mật khẩu mặc định: 123)', 'success');
      setShowModal(false);
      setForm({ phone: '', fullName: '', password: '123', avatarUrl: '' });
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
                <th className="p-4 font-medium">Hội Viên</th>
                <th className="p-4 font-medium">Số Điện Thoại</th>
                <th className="p-4 font-medium">Gói Đang Tập</th>
                <th className="p-4 font-medium text-center">Hành Động</th>
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
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400 uppercase overflow-hidden border border-gray-700">
                        {m.memberProfile?.avatarUrl ? (
                          <img src={m.memberProfile.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          m.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <p>{m.fullName}</p>
                        <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[8px] ${chipColor}`}>
                          {chipLabel}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">{m.phone}</td>
                    <td className="p-4 text-gray-300 font-medium">{planName}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {activeSubs.length > 0 && (
                          <>
                            <button 
                              onClick={async () => {
                                if (!confirm('Xác nhận Bảo lưu gói tập này?')) return;
                                await membershipService.updateSubscriptionStatus(activeSubs[0].id, 'FROZEN');
                                setPage(pagination.page); // refresh
                              }}
                              title="Bảo lưu" 
                              className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition"
                            >
                              <Snowflake size={14}/>
                            </button>
                            <button 
                              onClick={() => alert('Chọn hội viên đích để chuyển nhượng...')}
                              title="Chuyển nhượng" 
                              className="p-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition"
                            >
                              <ArrowRightLeft size={14}/>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>

        {/* Phân trang UI */}
        <div className="p-4 border-t border-gray-800 flex justify-between items-center text-sm text-gray-500 mt-auto bg-gray-900">
          Hiển thị trang {pagination.page} / {pagination.totalPages} (Tổng cộng {pagination.total} hồ sơ)
          <div className="flex gap-2">
            <button 
              disabled={pagination.page <= 1} 
              onClick={() => setPage(pagination.page - 1)} 
              className="px-4 py-2 border border-gray-800 rounded bg-gray-800 text-white disabled:opacity-50 transition-colors hover:bg-gray-700"
            >
              Trước
            </button>
            <button 
              disabled={pagination.page >= pagination.totalPages} 
              onClick={() => setPage(pagination.page + 1)} 
              className="px-4 py-2 border border-gray-800 rounded bg-gray-800 text-white disabled:opacity-50 transition-colors hover:bg-gray-700"
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-[400px]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><PlusCircle className="text-[#39FF14] w-6 h-6"/> Thêm Hồ Sơ Mới</h2>
            <p className="text-gray-400 text-sm mb-4">Hồ sơ sẽ tự động được link với Cơ sở dữ liệu Cổng từ Check-in.</p>
            <form onSubmit={handleCreateNew} className="space-y-4">
              <div className="flex gap-4 items-center bg-gray-800 p-4 rounded-2xl border border-gray-700">
                 <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden border border-[#39FF14]/30">
                    {form.avatarUrl ? (
                      <img src={form.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-gray-600" />
                    )}
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Ảnh Chân Dung</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      id="avatar-upload"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploading(true);
                          try {
                            const res = await uploadService.uploadFile(file);
                            setForm({...form, avatarUrl: res.url});
                          } finally { setUploading(false); }
                        }
                      }}
                    />
                    <label htmlFor="avatar-upload" className="bg-gray-700 hover:bg-gray-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg cursor-pointer uppercase transition">
                      {uploading ? 'Đang tải...' : 'Chụp/Chọn Ảnh'}
                    </label>
                 </div>
              </div>
              <div>
                 <label className="block text-gray-500 text-[10px] font-black uppercase mb-1 ml-1">Họ & Tên Hội Viên *</label>
                 <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required className="w-full p-4 bg-gray-800 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#39FF14] text-white font-bold" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div>
                 <label className="block text-gray-500 text-[10px] font-black uppercase mb-1 ml-1">Số Điện Thoại (Dùng để đăng nhập) *</label>
                 <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="w-full p-4 bg-gray-800 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#39FF14] text-white font-mono" placeholder="09xxxxxxxx" />
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
