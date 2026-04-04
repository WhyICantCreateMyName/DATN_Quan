'use client';

import { useState } from 'react';
import axiosClient from '@/services/axiosClient';
import { ScanFace, Fingerprint, CheckCircle, XCircle, Search, UserCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function CheckinPage() {
  const { showToast } = useToast();
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'failed' | 'loading'>('idle');
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [phoneInput, setPhoneInput] = useState('');

  const lookupUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneInput) return;

    setScanStatus('loading');
    try {
      const data: any = await axiosClient.post('/checkin/lookup', { payload: phoneInput });
      setScannedUser(data);

      if (data.hasAccess) {
        setScanStatus('success');
        // Tự động record log mở cổng
        await axiosClient.post('/checkin/record', { memberId: data.memberId, method: 'QR' });
      } else {
        setScanStatus('failed'); // Hết hạn
      }

      setTimeout(() => setScanStatus('idle'), 6000);
    } catch (e: any) {
      setScanStatus('failed');
      setScannedUser(null);
      showToast('Lỗi tra cứu: ' + (e.error || e.message), 'error');
      setTimeout(() => setScanStatus('idle'), 4000);
    }
  };

  const manualUnlock = async () => {
     if (!scannedUser) {
        showToast('Cổng mở cho khách vãng lai', 'info');
        return;
     }
     await axiosClient.post('/checkin/record', { memberId: scannedUser.memberId, method: 'MANUAL' });
     showToast('Đã ép mở cổng thành công!', 'success');
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Trạm Kiểm Soát <span className="text-[#39FF14]">Vào Ra</span></h1>
          <p className="text-gray-400">Giám sát Check-in Cổng từ. Quét thẻ / QR liên kết tới dữ liệu Member Real-time.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-8">
        {/* Left: Cổng từ */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ScanFace className="w-96 h-96" />
          </div>

          <div className="relative z-10 text-center">
            {(scanStatus === 'idle' || scanStatus === 'loading') && (
              <div className="flex flex-col items-center animate-pulse">
                <Fingerprint className="w-24 h-24 text-gray-500 mb-6" />
                <h2 className="text-2xl font-bold text-gray-400">{scanStatus === 'loading' ? 'ĐANG TÌM KIẾM...' : 'HỆ THỐNG SẴN SÀNG'}</h2>
                <p className="text-gray-500 mt-2">Vui lòng quét thẻ hoặc nhập SĐT kiểm tra...</p>
              </div>
            )}

            {scanStatus === 'success' && (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-[#39FF14]/20 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(57,255,20,0.5)]">
                  <CheckCircle className="w-16 h-16 text-[#39FF14]" />
                </div>
                <h2 className="text-3xl font-black text-[#39FF14] uppercase tracking-widest">Xác Thực Thành Công</h2>
                <p className="text-white font-medium mt-2">Cổng từ mở (Open Gate). Chào mừng {scannedUser?.name}!</p>
              </div>
            )}

            {scanStatus === 'failed' && (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                  <XCircle className="w-16 h-16 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest">Truy Cập Bị Từ Chối</h2>
                <p className="text-gray-400 font-medium mt-2">{scannedUser ? 'Hội viên đã hết hạn gói tập.' : 'Không thể định danh vân tay/SĐT này.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Thông tin */}
        <div className="w-[450px] bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col relative overflow-hidden">
          <h3 className="font-bold text-gray-400 uppercase tracking-wider mb-8 text-sm flex items-center gap-2">
            <UserCircle2 className="w-4 h-4" /> Dữ Liệu Hồ Sơ
          </h3>

          {!scannedUser ? (
             <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">Chưa có ai check-in.</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border-2 border-[#39FF14]">
                   {scanStatus === 'failed' ? <XCircle className="text-red-500 w-10 h-10"/> : <CheckCircle className="text-[#39FF14] w-10 h-10"/>}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{scannedUser.name}</h2>
                  <p className="text-gray-400 text-sm">{scannedUser.phone}</p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-800 space-y-4 text-sm mt-8">
                <div className="flex justify-between">
                  <span className="text-gray-400">Gói Tập Hiện Tại</span>
                  <span className={`font-bold ${scannedUser.hasAccess ? 'text-[#39FF14]' : 'text-red-500'} text-right`}>{scannedUser.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ngày Hết Hạn</span>
                  <span className="font-bold text-white text-right">{scannedUser.expireDate}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-700/50 pt-4 mt-2">
                  <span className="text-gray-400">Thời gian còn lại</span>
                  <span className={`${scannedUser.hasAccess ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-red-500/10 text-red-500'} px-3 py-1 rounded-lg font-bold`}>
                    Còn {scannedUser.remainingDays} Ngày
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto pt-6">
            <form onSubmit={lookupUser} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 cursor-pointer" onClick={lookupUser} />
              <input 
                type="text" 
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder="Nhập SĐT để Validate khách hàng..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border-none rounded-xl focus:ring-1 focus:ring-[#39FF14] outline-none text-white text-sm"
              />
            </form>
            <button onClick={manualUnlock} className="w-full bg-gray-800 border border-gray-700 text-white font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-white hover:text-black hover:border-white transition-all text-sm">
               Bỏ Qua Lỗi & Ép Mở Cổng Tự Động
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
