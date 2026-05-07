'use client';

import { useState } from 'react';
import { Users, Clock, Percent, Target, Plus, Calendar, Mail, Phone, ShieldCheck, Edit2, Trash2, Camera } from 'lucide-react';
import { useHRM } from '@/hooks/useHRM';
import { formatVND } from '@/libs/utils';
import { uploadService } from '@/services/uploadService';
import { userService } from '@/services/userService';
import { useToast } from '@/context/ToastContext';
import Pagination from '../Pagination';

export default function Staff() {
  const { showToast } = useToast();
  const { staff, shifts, rates, kpis, logs, loading, refresh, updateStaff, deleteStaff } = useHRM();
  const [activeTab, setActiveTab] = useState<'staff' | 'shifts' | 'commission' | 'kpi'>('staff');
  const [page, setPage] = useState(1);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', role: 'PT', avatarUrl: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateStaff(editingId, { fullName: form.fullName, phone: form.phone, role: form.role });
        if (form.avatarUrl) {
          await userService.updateProfile(editingId, { avatarUrl: form.avatarUrl });
        }
        showToast('Cập nhật thông tin nhân sự thành công', 'success');
      } else {
        const newUser = await userService.createUser({
          fullName: form.fullName,
          phone: form.phone,
          role: form.role,
          password: '123'
        });
        if (form.avatarUrl && newUser.id) {
          await userService.updateProfile(newUser.id, { avatarUrl: form.avatarUrl });
        }
        showToast('Thêm nhân viên thành công (Mật khẩu: 123)', 'success');
        refresh(page);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ fullName: '', phone: '', role: 'PT', avatarUrl: '' });
    } catch (error: any) {
      showToast('Lỗi: ' + error.message, 'error');
    }
  };

  const openEdit = (member: any) => {
    setEditingId(member.id);
    setForm({
      fullName: member.fullName,
      phone: member.phone,
      role: member.role,
      avatarUrl: member.memberProfile?.avatarUrl || member.trainerProfile?.avatarUrl || ''
    });
    setShowModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight italic">
            Quản Trị <span className="text-[#39FF14]">Nhân Sự</span>
          </h1>
          <p className="text-gray-400 mt-1">Quản lý đội ngũ, lịch trực và hiệu suất làm việc của TitanGym.</p>
        </div>
        
        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
           <button onClick={()=>{setActiveTab('staff'); setPage(1);}} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'staff' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}>Nhân Viên</button>
           <button onClick={()=>{setActiveTab('shifts'); setPage(1);}} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'shifts' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}>Lịch Trực</button>
           <button onClick={()=>{setActiveTab('commission'); setPage(1);}} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'commission' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}>Hoa Hồng</button>
           <button onClick={()=>{setActiveTab('kpi'); setPage(1);}} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'kpi' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}>Chỉ Tiêu KPI</button>
        </div>
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col relative">
        
        {activeTab === 'staff' && (
          <div className="flex-1 flex flex-col overflow-hidden">
             <div className="p-8 flex justify-between items-center border-b border-gray-800 bg-gray-800/20">
                <h3 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-[#39FF14]"/> Đội Ngũ Nhân Sự</h3>
                <button 
                  onClick={() => { setEditingId(null); setForm({ fullName: '', phone: '', role: 'PT', avatarUrl: '' }); setShowModal(true); }}
                  className="bg-[#39FF14] text-black font-black px-6 py-2 rounded-xl text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                >
                  <Plus size={18}/> THÊM NHÂN VIÊN
                </button>
             </div>

             <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-900 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                    <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-800">
                      <th className="p-6 pl-8">Mã NV</th>
                      <th className="p-6">Nhân Viên</th>
                      <th className="p-6">Số Điện Thoại</th>
                      <th className="p-6">Vai Trò</th>
                      <th className="p-6">Trạng Thái</th>
                      <th className="p-6 text-right pr-8">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {staff?.data.map(member => (
                      <tr key={member.id} className="hover:bg-gray-800/20 transition-colors group">
                        <td className="p-6 pl-8 font-mono text-gray-500 text-xs">ST_{member.id}</td>
                        <td className="p-6 font-bold text-white">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-black text-[#39FF14] overflow-hidden">
                                 {member.memberProfile?.avatarUrl || member.trainerProfile?.avatarUrl ? (
                                   <img src={member.memberProfile?.avatarUrl || member.trainerProfile?.avatarUrl || ''} className="w-full h-full object-cover" />
                                 ) : (
                                   member.fullName.charAt(0)
                                 )}
                              </div>
                              <div>
                                 <p className="text-base uppercase tracking-tight">{member.fullName}</p>
                                 <p className="text-[10px] text-gray-500 font-mono italic">{member.fullName.toLowerCase().replace(' ', '.')}@titangym.vn</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-6 text-gray-300 font-mono text-sm">{member.phone}</td>
                        <td className="p-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             member.role === 'PT' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                             member.role === 'RECEPTIONIST' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                             'bg-purple-500/10 text-purple-500 border-purple-500/20'
                           }`}>
                             {member.role === 'PT' ? 'HLV Cá Nhân' : member.role === 'RECEPTIONIST' ? 'Lễ Tân' : 'Quản Lý'}
                           </span>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_5px_#39FF14]"></div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">Đang làm việc</span>
                           </div>
                        </td>
                        <td className="p-6 text-right pr-8">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(member)} className="p-2 text-gray-500 hover:text-[#39FF14] transition-colors" title="Sửa nhân sự">
                                 <Edit2 size={16}/>
                              </button>
                              <button onClick={() => deleteStaff(member.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Xóa nhân sự">
                                 <Trash2 size={16}/>
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>

             <div className="border-t border-gray-800">
               <Pagination 
                 currentPage={page}
                 totalItems={staff?.total || 0}
                 limit={staff?.limit || 10}
                 onPageChange={(p) => { setPage(p); refresh(p); }}
               />
             </div>
          </div>
        )}

        {activeTab === 'shifts' && (
          <div className="p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="text-[#39FF14]"/> Bảng Phân Ca Làm Việc</h3>
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition">
                <Plus size={16}/> Sắp Ca Mới
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shifts.map(s => (
                <div key={s.id} className="bg-gray-800/40 border border-gray-700 p-5 rounded-2xl">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-[#39FF14]">
                        {s.user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white leading-none">{s.user.fullName}</p>
                        <p className="text-[10px] text-gray-500 uppercase mt-1">{s.user.role}</p>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Bắt đầu:</span>
                        <span className="text-white font-mono">{new Date(s.startTime).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Kết thúc:</span>
                        <span className="text-white font-mono">{new Date(s.endTime).toLocaleString('vi-VN')}</span>
                      </div>
                   </div>
                   {s.note && <p className="mt-4 text-xs text-gray-400 bg-gray-900/50 p-2 rounded-lg italic">"{s.note}"</p>}
                </div>
              ))}
              {shifts.length === 0 && <p className="text-gray-500 col-span-full py-20 text-center italic">Chưa có lịch trực nào được sắp trong tuần này.</p>}
            </div>
          </div>
        )}

        {activeTab === 'commission' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-gray-800">
               <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><Percent className="text-[#39FF14]"/> Cấu Hình Hoa Hồng PT</h3>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {rates.map(r => (
                    <div key={r.id} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex justify-between items-center">
                       <div>
                          <p className="text-gray-400 text-xs uppercase font-black mb-1">{r.name}</p>
                          <p className="text-2xl font-black text-white">{r.value}{r.type === 'PERCENTAGE' ? '%' : ' VNĐ'}</p>
                          <p className="text-[10px] text-gray-500 mt-1">Áp dụng: {r.applyTo === 'SALE' ? 'Doanh số bán' : 'Số buổi dạy'}</p>
                       </div>
                       <button className="text-[#39FF14] text-xs font-bold hover:underline">Chỉnh sửa</button>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto">
               <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Lịch sử chi trả (Tạm tính)</h4>
               <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase">
                      <th className="pb-4">Nhân viên</th>
                      <th className="pb-4">Lý do nhận</th>
                      <th className="pb-4">Số tiền</th>
                      <th className="pb-4">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm border-t border-gray-800">
                    {logs.map(l => (
                      <tr key={l.id} className="border-b border-gray-800/50">
                        <td className="py-4 font-bold">{l.user.fullName}</td>
                        <td className="py-4 text-gray-400">{l.reason}</td>
                        <td className="py-4 text-[#39FF14] font-black">{formatVND(l.amount)}</td>
                        <td className="py-4 text-gray-500">{new Date(l.createdAt).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'kpi' && (
          <div className="p-8 h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2"><Target className="text-[#39FF14]"/> Theo Dõi Chỉ Tiêu KPI</h3>
                <div className="flex gap-4">
                   <select className="bg-gray-800 border-none rounded-xl px-4 py-2 text-white text-sm">
                      <option>Tháng {new Date().getMonth() + 1}</option>
                   </select>
                   <button className="bg-[#39FF14] text-black font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                      <Plus size={16}/> Thiết Lập KPI
                   </button>
                </div>
             </div>
             
             <div className="space-y-6">
                {kpis.map(k => {
                   const progress = Math.min(100, (k.achievedAmount / k.targetAmount) * 100);
                   return (
                    <div key={k.id} className="bg-gray-800/30 p-6 rounded-3xl border border-gray-700">
                       <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-[#39FF14]/10 flex items-center justify-center text-[#39FF14]"><Users size={20}/></div>
                             <p className="font-bold text-lg">{k.user.fullName}</p>
                          </div>
                          <p className="text-gray-400 font-mono">{formatVND(k.achievedAmount)} / {formatVND(k.targetAmount)}</p>
                       </div>
                       <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#39FF14] to-emerald-500" style={{ width: `${progress}%` }} />
                       </div>
                       <div className="flex justify-between mt-2">
                          <p className="text-[10px] text-gray-500 uppercase font-black">Tiến độ: {progress.toFixed(1)}%</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black">Cần đạt thêm: {formatVND(Math.max(0, k.targetAmount - k.achievedAmount))}</p>
                       </div>
                    </div>
                   );
                })}
                {kpis.length === 0 && <p className="text-gray-500 py-20 text-center italic">Chưa thiết lập chỉ tiêu KPI cho tháng này.</p>}
             </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-gray-900 border border-gray-800 rounded-[3rem] p-10 w-full max-w-md relative shadow-[0_0_50px_rgba(57,255,20,0.1)]">
            <h2 className="text-3xl font-black uppercase italic mb-8 flex items-center gap-3">
              <Edit2 className="text-[#39FF14]"/> Cập Nhật <span className="text-[#39FF14]">Nhân Sự</span>
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
                      id="staff-avatar-upload"
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
                    <label htmlFor="staff-avatar-upload" className="bg-[#39FF14] text-black text-[10px] font-black px-4 py-2 rounded-lg cursor-pointer uppercase transition hover:bg-white">
                      {uploading ? 'Đang tải...' : 'Tải Ảnh Mới'}
                    </label>
                 </div>
              </div>

              <div>
                 <label className="block text-gray-500 text-[10px] font-black uppercase mb-2 ml-4 tracking-widest">Họ & Tên Nhân Viên</label>
                 <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required className="w-full p-5 bg-gray-800 rounded-2xl border border-transparent focus:border-[#39FF14] outline-none text-white font-bold transition-all" />
              </div>

              <div>
                 <label className="block text-gray-500 text-[10px] font-black uppercase mb-2 ml-4 tracking-widest">Số Điện Thoại</label>
                 <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="w-full p-5 bg-gray-800 rounded-2xl border border-transparent focus:border-[#39FF14] outline-none text-white font-mono" />
              </div>

              <div>
                 <label className="block text-gray-500 text-[10px] font-black uppercase mb-2 ml-4 tracking-widest">Vai Trò Hệ Thống</label>
                 <select 
                   value={form.role} 
                   onChange={e => setForm({...form, role: e.target.value})}
                   className="w-full p-5 bg-gray-800 rounded-2xl border border-transparent focus:border-[#39FF14] outline-none text-white font-bold appearance-none cursor-pointer"
                 >
                    <option value="PT">Huấn Luyện Viên (PT)</option>
                    <option value="RECEPTIONIST">Lễ Tân (Receptionist)</option>
                    <option value="ADMIN">Quản Trị Viên (Admin)</option>
                 </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-2xl hover:bg-gray-700 transition uppercase tracking-widest">Hủy</button>
                <button type="submit" disabled={uploading} className="flex-1 bg-[#39FF14] text-black font-black py-4 rounded-2xl hover:bg-white transition uppercase tracking-widest disabled:opacity-50 shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
