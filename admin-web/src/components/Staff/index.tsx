'use client';

import { useState } from 'react';
import { Users, Clock, Percent, Target, Plus, Calendar } from 'lucide-react';
import { useHRM } from '@/hooks/useHRM';
import { formatVND } from '@/libs/utils';

export default function Staff() {
  const { shifts, rates, kpis, logs, loading, refresh, createShift, saveCommission, saveKPI } = useHRM();
  const [activeTab, setActiveTab] = useState<'shifts' | 'commission' | 'kpi'>('shifts');

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Quản Trị <span className="text-[#39FF14]">Nhân Sự</span></h1>
          <p className="text-gray-400 mt-1">Quản lý lịch trực, cấu hình hoa hồng PT và theo dõi chỉ tiêu KPI đội ngũ.</p>
        </div>
        
        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
           <button onClick={()=>setActiveTab('shifts')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'shifts' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}>Lịch Trực</button>
           <button onClick={()=>setActiveTab('commission')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'commission' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}>Hoa Hồng</button>
           <button onClick={()=>setActiveTab('kpi')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'kpi' ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:text-white'}`}>Chỉ Tiêu KPI</button>
        </div>
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden flex flex-col">
        {activeTab === 'shifts' && (
          <div className="p-8">
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
          <div className="flex-1 flex flex-col">
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
          <div className="p-8">
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
    </div>
  );
}
