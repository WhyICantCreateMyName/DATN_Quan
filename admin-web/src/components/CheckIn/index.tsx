'use client';

import { useState } from 'react';
import { ScanFace, Fingerprint, CheckCircle, XCircle, Search, UserCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useCheckIn } from '@/hooks/useCheckIn';

export default function CheckIn() {
  const { showToast } = useToast();
  const { status, member, lookup, reset } = useCheckIn();
  const [phoneInput, setPhoneInput] = useState('');

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneInput) return;

    try {
      await lookup(phoneInput);
      setTimeout(reset, 6000);
    } catch (e: any) {
      showToast('Lỗi tra cứu: ' + (e.error || e.message), 'error');
      setTimeout(reset, 4000);
    }
  };

  const manualUnlock = async () => {
    if (!member) {
      showToast('Cổng mở cho khách vãng lai', 'info');
      return;
    }
    showToast('Đã mở cổng cưỡng chế thành công!', 'success');
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Trạm Kiểm Soát Ra Vào (Check-in)</h1>
        <p className="text-xs text-[#6E6E77] mt-1">
          Giám sát cổng từ tự động. Quét thẻ hội viên, mã QR hoặc tra cứu theo số điện thoại theo thời gian thực.
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left: Màn hình Cổng từ */}
        <div className="flex-1 bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ScanFace className="w-96 h-96 text-[#18181B]" />
          </div>

          <div className="relative z-10 text-center max-w-sm">
            {(status === 'idle' || status === 'loading') && (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-[#F7F7F5] border border-[#E4E4E0] flex items-center justify-center mb-6 animate-pulse">
                  <Fingerprint className="w-12 h-12 text-[#EA580C]" />
                </div>
                <h2 className="text-xl font-bold text-[#18181B]">
                  {status === 'loading' ? 'ĐANG TÌM KIẾM...' : 'HỆ THỐNG SẴN SÀNG'}
                </h2>
                <p className="text-xs text-[#6E6E77] mt-2">
                  Vui lòng quét thẻ RFID, mã QR trên Mobile App hoặc nhập số điện thoại bên cạnh.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                <div className="w-24 h-24 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-5 text-[#15803D]">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black text-[#15803D] uppercase tracking-wider">
                  Xác Thực Thành Công
                </h2>
                <p className="text-xs font-semibold text-[#18181B] mt-2">
                  Cổng từ đã mở. Xin chào mừng <span className="font-bold text-[#EA580C]">{member?.name}</span>!
                </p>
              </div>
            )}

            {status === 'failed' && (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                <div className="w-24 h-24 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-5 text-red-600">
                  <XCircle className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black text-red-600 uppercase tracking-wider">
                  Từ Chối Truy Cập
                </h2>
                <p className="text-xs text-[#6E6E77] mt-2">
                  {member ? 'Gói tập của hội viên đã hết hạn hiệu lực.' : 'Không tìm thấy dữ liệu thẻ hoặc số điện thoại này.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Thẻ thông tin khách & Tra cứu */}
        <div className="w-full lg:w-[420px] bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="font-bold text-[#18181B] text-xs uppercase tracking-wider mb-6 flex items-center gap-2">
              <UserCircle2 className="w-4 h-4 text-[#EA580C]" /> Thông Tin Hồ Sơ Check-in
            </h3>

            {!member ? (
              <div className="py-16 text-center text-xs text-[#6E6E77] bg-[#F7F7F5] rounded-xl border border-dashed border-[#E4E4E0]">
                Chưa có lượt quét nào gần đây.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-3.5 p-3.5 bg-[#F7F7F5] rounded-xl border border-[#E4E4E0]">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border font-bold text-sm ${
                    member.hasAccess ? 'bg-green-50 text-[#15803D] border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#18181B]">{member.name}</h4>
                    <p className="font-mono text-xs text-[#6E6E77]">{member.phone}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-3 rounded-lg bg-[#F7F7F5]">
                    <span className="text-[#6E6E77]">Gói tập hiện tại:</span>
                    <span className="font-bold text-[#18181B]">{member.plan}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-[#F7F7F5]">
                    <span className="text-[#6E6E77]">Ngày hết hạn:</span>
                    <span className="font-mono font-medium text-[#18181B]">{member.expireDate}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#F7F7F5]">
                    <span className="text-[#6E6E77]">Trạng thái:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      member.hasAccess
                        ? 'bg-green-50 text-[#15803D] border-green-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {member.hasAccess ? `Còn ${member.remainingDays} ngày` : 'Đã hết hạn'}
                    </span>
                  </div>
                  {member.remainingPtSessions !== undefined && (
                    <div className="flex justify-between p-3 rounded-lg bg-orange-50/60 border border-orange-100">
                      <span className="text-[#6E6E77]">Ví buổi PT còn lại:</span>
                      <span className="font-mono font-bold text-[#EA580C]">{member.remainingPtSessions} buổi</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Tra Cứu Nhanh & Mở Thủ Công */}
          <div className="pt-6 border-t border-[#E4E4E0] space-y-3 mt-6">
            <form onSubmit={handleLookup} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77] w-4 h-4 cursor-pointer" onClick={handleLookup} />
              <input
                type="text"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder="Nhập SĐT hội viên để tra cứu..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl text-xs text-[#18181B] placeholder-[#6E6E77] focus:outline-hidden focus:border-[#EA580C]"
              />
            </form>
            <button
              onClick={manualUnlock}
              className="w-full py-2.5 px-4 bg-[#FFFFFF] border border-[#E4E4E0] text-[#18181B] hover:bg-[#F7F7F5] font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Mở Cổng Khách Vãng Lai / Cưỡng Chế
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
