'use client';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">Cấu hình <span className="text-[#39FF14]">Hệ Thống</span></h1>
        <p className="text-gray-400">Thay đổi các tham số nhạy cảm và thông tin hoạt động chi nhánh.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 mb-8 space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-4 text-white">Thông Tin Phòng Tập</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tên Thương Hiệu</label>
              <input type="text" defaultValue="TitanGym Premium" className="w-full bg-gray-800 border-none rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#39FF14]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Đường Dây Nóng</label>
              <input type="text" defaultValue="1900 6868" className="w-full bg-gray-800 border-none rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#39FF14]" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Trụ Sở Chính</label>
              <input type="text" defaultValue="12 Đường Cầu Giấy, Hà Nội" className="w-full bg-gray-800 border-none rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#39FF14]" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-4 text-red-500">Khu Tự Trị Nâng Cao</h3>
          <p className="text-gray-400 text-sm mb-6 pb-6 border-b border-gray-800">Cẩn trọng khi thay đổi các thông số cấu trúc dưới đây. Nó ảnh hưởng trực tiếp đến CSDL.</p>
          
          <div className="flex items-center justify-between mb-4 bg-gray-800 p-4 rounded-xl">
            <div>
              <p className="font-bold text-white">Chế độ Bảo trì (Maintenance Mode)</p>
              <p className="text-gray-500 text-sm">Chặn tất cả khách vãng lai và Thành viên truy cập ứng dụng Mobile/Web App.</p>
            </div>
            <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-gray-400 rounded-full absolute left-1 top-1"></div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
            <div>
              <p className="font-bold text-red-500">Xóa Cache Dữ Liệu</p>
              <p className="text-red-400/70 text-sm">Clear toàn bộ Log API đã lưu (Nên thực hiện 1 tháng / lần để tối ưu RAM server).</p>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Kích Hoạt Dọn Dẹp</button>
          </div>
        </div>
      </div>
    </div>
  );
}
