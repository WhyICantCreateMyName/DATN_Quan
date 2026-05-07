'use client';

import { useState } from 'react';
import { PlusCircle, Camera, Edit2, Trash2, Snowflake, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useMembers } from '@/hooks/useMembers';
import { userService } from '@/services/userService';
import { membershipService } from '@/services/membershipService';
import { uploadService } from '@/services/uploadService';

import Pagination from '@/components/Pagination';

export default function Members() {
  const { showToast } = useToast();
  const { members, pagination, loading, setPage, createMember, updateMember, deleteMember } = useMembers();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ phone: '', fullName: '', password: '123', avatarUrl: '', role: 'MEMBER' });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMember(editingId, { fullName: form.fullName, phone: form.phone });
        if (form.avatarUrl) {
          await userService.updateProfile(editingId, { avatarUrl: form.avatarUrl });
        }
        showToast('Cập nhật thông tin hội viên thành công', 'success');
      } else {
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
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ phone: '', fullName: '', password: '123', avatarUrl: '', role: 'MEMBER' });
    } catch (error: any) {
      showToast('Lỗi: ' + error.message, 'error');
    }
  };

  const openEdit = (m: any) => {
    setEditingId(m.id);
    setForm({
      fullName: m.fullName,
      phone: m.phone,
      password: '',
      avatarUrl: m.memberProfile?.avatarUrl || '',
      role: m.role
    });
    setShowModal(true);
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight italic">Hồ Sơ <span className="text-[#39FF14]">Hội Viên</span></h1>
          <p className="text-gray-400">Quản lý Khách Hàng, Gói Tập và Trạng Thái Thẻ.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setForm({ phone: '', fullName: '', password: '123', avatarUrl: '', role: 'MEMBER' }); setShowModal(true); }}
          className="bg-[#39FF14] text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)]"
        >
          <PlusCircle className="w-5 h-5"/> KHỞI TẠO HỒ SƠ
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] flex flex-col flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr className="bg-gray-800/40 text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-800">
                <th className="p-6 pl-8">Mã HV</th>
                <th className="p-6">Hội Viên</th>
                <th className="p-6">Số Điện Thoại</th>
                <th className="p-6">Gói Đang Tập</th>
                <th className="p-6 text-right pr-8">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500 animate-pulse">Đang đồng bộ dữ liệu...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500 italic">Hệ thống chưa có dữ liệu hội viên.</td></tr>
              ) : members.map((m) => {
                const activeSubs = m.memberProfile?.subscriptions?.filter((s: any) => s.status === 'ACTIVE') || [];
                const planName = activeSubs.length > 0 ? activeSubs[0].plan?.name : 'Vãng Lai';
                
                let chipColor = 'bg-gray-500/10 text-gray-500 border-gray-500/20';
                let chipLabel = 'Chưa đăng ký';
                
                if (activeSubs.length > 0) {
                     const endD = new Date(activeSubs[0].endDate);
                     const now = new Date();
                     const remaining = Math.max(0, Math.ceil((endD.getTime() - now.getTime()) / (1000 * 3600 * 24)));
                     if (remaining > 0) {
                         chipColor = 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20';
                         chipLabel = `Còn ${remaining} ngày`;
                     } else {
                         chipColor = 'bg-red-500/10 text-red-500 border-red-500/20';
                         chipLabel = 'Đã hết hạn';
                     }
                }

                return (
                  <tr key={m.id} className="hover:bg-gray-800/20 transition-colors group">
                    <td className="p-6 pl-8 font-mono text-gray-500 text-xs">HV_{m.id}</td>
                    <td className="p-6 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-400 uppercase overflow-hidden">
                          {m.memberProfile?.avatarUrl ? (
                            <img src={m.memberProfile.avatarUrl} className="w-full h-full object-cover" />
                          ) : (
                            m.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="uppercase tracking-tight text-base">{m.fullName}</p>
                          <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[8px] border ${chipColor}`}>
                            {chipLabel}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-gray-300 font-mono">{m.phone}</td>
                    <td className="p-6 text-gray-300 font-bold uppercase text-xs">{planName}</td>
                    <td className="p-6 text-right pr-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(m)} className="p-2 text-gray-500 hover:text-[#39FF14] transition-colors" title="Sửa hồ sơ">
                          <Edit2 size={16}/>
                        </button>
                        {activeSubs.length > 0 && (
                          <button 
                            onClick={async () => {
                              if (!confirm('Xác nhận Bảo lưu gói tập này?')) return;
                              await membershipService.updateSubscriptionStatus(activeSubs[0].id, 'FROZEN');
                              setPage(pagination.page);
                            }}
                            title="Bảo lưu" 
                            className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                          >
                            <Snowflake size={16}/>
                          </button>
                        )}
                        <button onClick={() => deleteMember(m.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Xóa hội viên">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={pagination.page}
          totalItems={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-gray-900 border border-gray-800 rounded-[3rem] p-10 w-full max-w-md relative shadow-[0_0_50px_rgba(57,255,20,0.1)]">
            <h2 className="text-3xl font-black uppercase italic mb-8 flex items-center gap-3">
              {editingId ? <Edit2 className="text-[#39FF14]"/> : <PlusCircle className="text-[#39FF14]"/>}
              {editingId ? 'Cập Nhật' : 'Thêm'} <span className="text-[#39FF14]">Hội Viên</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-6 items-center bg-gray-800/50 p-5 rounded-[2rem] border border-gray-700">
                 <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden border-2 border-[#39FF14]/30">
                    {form.avatarUrl ? (
                      <img src={form.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-gray-700" />
                    )}
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Ảnh Chân Dung</p>
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
                    <label htmlFor="avatar-upload" className="bg-[#39FF14] text-black text-[10px] font-black px-4 py-2 rounded-lg cursor-pointer uppercase transition hover:bg-white">
                      {uploading ? 'Đang tải...' : 'Tải Ảnh Mới'}
                    </label>
                 </div>
              </div>

              <div>
                 <label className="block text-gray-500 text-[10px] font-black uppercase mb-2 ml-4 tracking-widest">Họ & Tên Hội Viên</label>
                 <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required className="w-full p-5 bg-gray-800 rounded-2xl border border-transparent focus:border-[#39FF14] outline-none text-white font-bold transition-all" placeholder="VD: NGUYỄN VĂN A" />
              </div>

              <div>
                 <label className="block text-gray-500 text-[10px] font-black uppercase mb-2 ml-4 tracking-widest">Số Điện Thoại</label>
                 <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="w-full p-5 bg-gray-800 rounded-2xl border border-transparent focus:border-[#39FF14] outline-none text-white font-mono" placeholder="09xxxxxxxx" />
              </div>

              {!editingId && (
                <p className="text-[10px] text-gray-500 italic text-center">Mật khẩu mặc định khởi tạo sẽ là "123"</p>
              )}

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-2xl hover:bg-gray-700 transition uppercase tracking-widest">Hủy</button>
                <button type="submit" disabled={uploading} className="flex-1 bg-[#39FF14] text-black font-black py-4 rounded-2xl hover:bg-white transition uppercase tracking-widest disabled:opacity-50 shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                  Xác Nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
