'use client';

import { useState } from 'react';
import { PlusCircle, Camera, Edit2, Trash2, Snowflake, User, X } from 'lucide-react';
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
        showToast('Thêm thành công Hội Viên mới (Mật khẩu: 123)', 'success');
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
      avatarUrl: m.avatarUrl || m.memberProfile?.avatarUrl || '',
      role: m.role
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Hồ Sơ Hội Viên</h1>
          <p className="text-xs text-[#6E6E77] mt-1">
            Quản lý danh sách khách hàng, tình trạng gói tập và lịch sử thành viên.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({ phone: '', fullName: '', password: '123', avatarUrl: '', role: 'MEMBER' });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" /> Khởi Tạo Hồ Sơ
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4E4E0] bg-[#F7F7F5] text-[11px] font-bold text-[#6E6E77] uppercase tracking-wider">
                <th className="py-3 px-6">Mã HV</th>
                <th className="py-3 px-6">Hội Viên</th>
                <th className="py-3 px-6">Số Điện Thoại</th>
                <th className="py-3 px-6">Gói Đang Tập</th>
                <th className="py-3 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E0] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6E6E77] animate-pulse">
                    Đang đồng bộ dữ liệu hội viên...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6E6E77]">
                    Hệ thống chưa có dữ liệu hội viên nào.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const activeSubs = m.memberProfile?.subscriptions?.filter((s: any) => s.status === 'ACTIVE') || [];
                  const planName = activeSubs.length > 0 ? activeSubs[0].plan?.name : 'Vãng Lai';

                  let chipColor = 'bg-[#F7F7F5] text-[#6E6E77] border-[#E4E4E0]';
                  let chipLabel = 'Chưa đăng ký';

                  if (activeSubs.length > 0) {
                    const endD = new Date(activeSubs[0].endDate);
                    const now = new Date();
                    const remaining = Math.max(0, Math.ceil((endD.getTime() - now.getTime()) / (1000 * 3600 * 24)));
                    if (remaining > 0) {
                      chipColor = 'bg-green-50 text-[#15803D] border-green-200';
                      chipLabel = `Còn ${remaining} ngày`;
                    } else {
                      chipColor = 'bg-red-50 text-red-600 border-red-200';
                      chipLabel = 'Đã hết hạn';
                    }
                  }

                  return (
                    <tr key={m.id} className="hover:bg-[#F7F7F5]/60 transition-colors group">
                      <td className="py-3.5 px-6 font-mono text-[11px] text-[#6E6E77]">
                        HV_{m.id}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-[#18181B]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F7F7F5] border border-[#E4E4E0] flex items-center justify-center text-xs font-bold text-[#EA580C] overflow-hidden shrink-0">
                            {m.avatarUrl ? (
                              <img src={m.avatarUrl} alt={m.fullName} className="w-full h-full object-cover" />
                            ) : (
                              m.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#18181B]">{m.fullName}</p>
                            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full font-bold text-[9px] border ${chipColor}`}>
                              {chipLabel}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-mono font-medium text-[#18181B]">
                        {m.phone}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-xs text-[#18181B]">
                        {planName}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(m)}
                            className="p-1.5 rounded-lg text-[#6E6E77] hover:text-[#EA580C] hover:bg-orange-50 transition-colors cursor-pointer"
                            title="Sửa hồ sơ"
                          >
                            <Edit2 size={15} />
                          </button>
                          {activeSubs.length > 0 && (
                            <button
                              onClick={async () => {
                                if (!confirm('Xác nhận Bảo lưu gói tập này?')) return;
                                await membershipService.updateSubscriptionStatus(activeSubs[0].id, 'FROZEN');
                                setPage(pagination.page);
                              }}
                              title="Bảo lưu gói"
                              className="p-1.5 rounded-lg text-[#6E6E77] hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Snowflake size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteMember(m.id)}
                            className="p-1.5 rounded-lg text-[#6E6E77] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Xóa hội viên"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#E4E4E0] bg-[#FFFFFF]">
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Modal Thêm / Cập Nhật */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E0]">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#EA580C]" />
                <h3 className="font-bold text-[#18181B] text-base">
                  {editingId ? 'Cập Nhật Hồ Sơ Hội Viên' : 'Thêm Hội Viên Mới'}
                </h3>
              </div>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="p-1 rounded-lg text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex gap-4 items-center p-3.5 bg-[#F7F7F5] rounded-xl border border-[#E4E4E0]">
                <div className="w-16 h-16 rounded-full bg-[#FFFFFF] border border-[#E4E4E0] flex items-center justify-center overflow-hidden shrink-0">
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-[#6E6E77]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-[#6E6E77] uppercase mb-1.5">Ảnh Đại Diện</p>
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
                          setForm({ ...form, avatarUrl: res.url });
                        } finally {
                          setUploading(false);
                        }
                      }
                    }}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-block px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E0] text-xs font-bold text-[#18181B] hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                  >
                    {uploading ? 'Đang tải lên...' : 'Chọn Ảnh Chân Dung'}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                  Họ và tên hội viên <span className="text-[#EA580C]">*</span>
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  required
                  placeholder="VD: Nguyễn Minh Quân"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-medium text-[#18181B] placeholder-[#6E6E77] focus:outline-hidden focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                  Số điện thoại <span className="text-[#EA580C]">*</span>
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  required
                  placeholder="VD: 0988888888"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-mono font-bold text-[#18181B] placeholder-[#6E6E77] focus:outline-hidden focus:border-[#EA580C]"
                />
              </div>

              {!editingId && (
                <p className="text-[11px] text-[#6E6E77] italic text-center">
                  Mật khẩu mặc định khởi tạo trên hệ thống là: <span className="font-mono font-bold text-[#18181B]">123</span>
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  className="px-4 py-2 rounded-xl border border-[#E4E4E0] text-xs font-bold text-[#6E6E77] hover:bg-[#F7F7F5] transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer disabled:opacity-50"
                >
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
