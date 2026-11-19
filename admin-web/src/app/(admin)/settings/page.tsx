'use client';

import { useState } from 'react';
import { Settings, Building, ShieldAlert, RefreshCw, CheckCircle, Database } from 'lucide-react';

export default function SettingsPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearCache = () => {
    setClearing(true);
    setTimeout(() => {
      setClearing(false);
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Cấu Hình Hệ Thống</h1>
        <p className="text-xs text-[#6E6E77] mt-1">
          Thay đổi các tham số nhạy cảm và thông tin hoạt động chi nhánh phòng gym.
        </p>
      </div>

      {/* Thông tin phòng tập */}
      <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2 mb-1">
            <Building className="w-5 h-5 text-[#EA580C]" /> Thông Tin Phòng Tập
          </h3>
          <p className="text-xs text-[#6E6E77]">Thông tin cơ sở vật chất hiển thị trên hóa đơn và thẻ hội viên</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Tên thương hiệu</label>
            <input
              type="text"
              defaultValue="Titan Gym Premium Fitness"
              className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Đường dây nóng (Hotline)</label>
            <input
              type="text"
              defaultValue="1900 6868"
              className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Địa chỉ chi nhánh chính</label>
            <input
              type="text"
              defaultValue="12 Đường Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội"
              className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button className="px-5 py-2 bg-[#EA580C] text-white font-bold text-xs rounded-xl hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer">
            Lưu Thay Đổi
          </button>
        </div>
      </div>

      {/* Khu tự trị nâng cao */}
      <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-red-600 flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-red-600" /> Vùng Quản Trị Hệ Thống Nâng Cao
          </h3>
          <p className="text-xs text-[#6E6E77]">
            Thận trọng khi thao tác các tính năng này vì có thể ảnh hưởng đến kết nối của hội viên.
          </p>
        </div>

        <div className="space-y-4">
          {/* Chế độ bảo trì */}
          <div className="flex items-center justify-between p-4 bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl">
            <div>
              <p className="font-bold text-xs text-[#18181B]">Chế độ Bảo trì (Maintenance Mode)</p>
              <p className="text-[#6E6E77] text-[11px] mt-0.5">
                Tạm dừng cho phép hội viên đăng nhập trên Mobile App khi nâng cấp hệ thống.
              </p>
            </div>
            <button
              onClick={() => setMaintenance(!maintenance)}
              className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                maintenance ? 'bg-[#EA580C]' : 'bg-[#E4E4E0]'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  maintenance ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Dọn dẹp Cache */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50/50 border border-red-100 rounded-xl">
            <div>
              <p className="font-bold text-xs text-red-700 flex items-center gap-1.5">
                <Database className="w-4 h-4" /> Làm Sạch Cache Dữ Liệu Tạm
              </p>
              <p className="text-red-600/70 text-[11px] mt-0.5">
                Xóa cache phiên đăng nhập và log tra cứu để giải phóng bộ nhớ đệm server.
              </p>
            </div>
            <button
              onClick={handleClearCache}
              disabled={clearing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {clearing ? 'Đang dọn dẹp...' : cleared ? '✓ Đã dọn sạch' : 'Kích Hoạt Dọn Dẹp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
