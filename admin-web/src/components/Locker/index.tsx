'use client';

import { useState } from 'react';
import {
  Box, PlusCircle, Trash2, User,
  AlertCircle, CheckCircle, Search, LayoutGrid, X
} from 'lucide-react';
import { useLocker } from '@/hooks/useLocker';
import { useMembers } from '@/hooks/useMembers';

export default function Locker() {
  const { lockerRows, loading, createRow, updateCell, deleteRow } = useLocker();
  const { members } = useMembers(); // Để gán member cho locker

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRow, setNewRow] = useState({ name: '', rowCount: 5, colCount: 10 });

  const [selectedCell, setSelectedCell] = useState<{ rowId: number, x: number, y: number, currentValue: any } | null>(null);
  const [memberSearch, setMemberSearch] = useState('');

  const handleAddRow = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRow(newRow.name, newRow.rowCount, newRow.colCount);
    setShowAddModal(false);
    setNewRow({ name: '', rowCount: 5, colCount: 10 });
  };

  const getCellName = (rowName: string, x: number, y: number) => {
    // x, y index 0-based. Vị trí 1-1 là x=0, y=0.
    // User nói: 1-1 thì tên là A01 (<tên><x-1><y>). 
    // Chắc user nhầm index? Thường là <tên><x><y> 1-based.
    // Tôi sẽ làm theo: <Tên><X><Y> (với X, Y là số thứ tự bắt đầu từ 1)
    // Nếu X=1, Y=1 -> A11. 
    // Nhưng user ví dụ A01. Có lẽ X-1 là tiền tố.
    const xStr = x.toString(); // x-1
    const yStr = (y + 1).toString().padStart(2, '0');
    return `${rowName}${xStr}${yStr}`;
  };

  console.log("lockerRows", lockerRows);


  const filteredMembers = members?.filter((m: any) =>
    m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.phone.includes(memberSearch)
  ).slice(0, 5) || [];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight italic">
            Hệ Thống <span className="text-[#39FF14]">Tủ Đồ (Locker)</span>
          </h1>
          <p className="text-gray-400 mt-1">Quản lý cấp phát, theo dõi trạng thái và bảo trì hệ thống locker.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#39FF14] text-black font-black px-6 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]"
        >
          <PlusCircle size={20} /> THIẾT LẬP DÃY MỚI
        </button>
      </div>

      <div className="flex-1 space-y-12 overflow-y-auto pb-20 pr-4 scrollbar-hide">
        {loading && <div className="text-center py-20 text-gray-500 animate-pulse">Đang đồng bộ trạng thái tủ đồ...</div>}

        {lockerRows && lockerRows.map((row) => (
          <div key={row.id} className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-800 bg-gray-800/20 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-3">
                  <LayoutGrid className="text-[#39FF14]" />
                  Dãy Locker {row.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">
                  Quy mô: {row.rowCount} hàng x {row.colCount} cột • Tổng {row.rowCount * row.colCount} ô
                </p>
              </div>
              <button
                onClick={() => deleteRow(row.id)}
                className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="p-8 overflow-x-auto">
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${row.colCount}, minmax(80px, 1fr))`,
                  width: 'fit-content',
                  minWidth: '100%'
                }}
              >
                {row.layout.map((rowArr, x) => (
                  rowArr.map((cell, y) => {
                    const isOccupied = typeof cell === 'number';
                    const isBroken = cell === 'BROKEN';
                    const member = isOccupied ? members?.find((m: any) => m.id === cell) : null;

                    return (
                      <button
                        key={`${x}-${y}`}
                        onClick={() => setSelectedCell({ rowId: row.id, x, y, currentValue: cell })}
                        className={`
                          aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all relative group
                          ${!cell ? 'border-gray-800 bg-gray-800/20 hover:border-[#39FF14] text-gray-600' : ''}
                          ${isOccupied ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]' : ''}
                          ${isBroken ? 'border-red-900 bg-red-900/10 text-red-500' : ''}
                        `}
                      >
                        <span className="text-[10px] font-black absolute top-2 left-2 opacity-50">
                          {getCellName(row.name, x, y)}
                        </span>

                        {!cell && <Box size={24} className="group-hover:scale-110 transition-transform" />}
                        {isOccupied && <User size={24} />}
                        {isBroken && <AlertCircle size={24} />}

                        <span className="text-[9px] font-bold uppercase tracking-tighter text-center line-clamp-1 px-1">
                          {!cell && 'Trống'}
                          {isOccupied && (member?.fullName || `ID: ${cell}`)}
                          {isBroken && 'Hỏng'}
                        </span>
                      </button>
                    );
                  })
                ))}
              </div>
            </div>

            <div className="px-8 py-4 bg-gray-800/10 border-t border-gray-800 flex gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500">
                <div className="w-3 h-3 rounded-sm bg-gray-800 border border-gray-700"></div> Sẵn sàng
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#39FF14]">
                <div className="w-3 h-3 rounded-sm bg-[#39FF14]"></div> Đang sử dụng
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500">
                <div className="w-3 h-3 rounded-sm bg-red-900"></div> Đang bảo trì
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL THÊM DÃY MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-[3rem] p-10 relative">
            <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
              <PlusCircle className="text-[#39FF14]" /> Thiết lập <span className="text-[#39FF14]">Dãy Tủ</span>
            </h2>
            <form onSubmit={handleAddRow} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Tên dãy (Vd: A, B, VIP...)</label>
                <input required value={newRow.name} onChange={e => setNewRow({ ...newRow, name: e.target.value })} className="w-full bg-gray-800 border-none rounded-2xl p-5 text-white font-black uppercase" placeholder="Dãy A" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Số hàng (X)</label>
                  <input type="number" value={newRow.rowCount} onChange={e => setNewRow({ ...newRow, rowCount: Number(e.target.value) })} className="w-full bg-gray-800 border-none rounded-2xl p-5 text-white font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-4 mb-2 block tracking-widest">Số cột (Y)</label>
                  <input type="number" value={newRow.colCount} onChange={e => setNewRow({ ...newRow, colCount: Number(e.target.value) })} className="w-full bg-gray-800 border-none rounded-2xl p-5 text-white font-bold" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-800 text-white font-black py-4 rounded-2xl">HỦY</button>
                <button type="submit" className="flex-2 bg-[#39FF14] text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.3)]">XÁC NHẬN</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT Ô LOCKER */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-6">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-[3rem] p-10 relative overflow-hidden">
            <button onClick={() => setSelectedCell(null)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition"><X /></button>

            <div className="mb-8">
              <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-[0.3em]">Cấu hình ô tủ</span>
              <h2 className="text-4xl font-black text-white uppercase italic">
                {getCellName(lockerRows.find(r => r.id === selectedCell.rowId)?.name || '', selectedCell.x, selectedCell.y)}
              </h2>
            </div>

            <div className="space-y-4">
              {/* TRẠNG THÁI TRỐNG -> CHO THUÊ */}
              {!selectedCell.currentValue && (
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-5 top-5 text-gray-500 w-5 h-5" />
                    <input
                      className="w-full bg-gray-800 border-none rounded-2xl p-5 pl-14 text-white"
                      placeholder="Tìm hội viên (Tên hoặc SĐT)..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredMembers.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          updateCell(selectedCell.rowId, selectedCell.x, selectedCell.y, m.id);
                          setSelectedCell(null);
                          setMemberSearch('');
                        }}
                        className="w-full bg-gray-800/50 hover:bg-[#39FF14] hover:text-black p-4 rounded-2xl flex justify-between items-center transition-all group"
                      >
                        <span className="font-bold">{m.fullName}</span>
                        <span className="text-xs opacity-50 group-hover:opacity-100 font-mono">{m.phone}</span>
                      </button>
                    ))}
                    {memberSearch && filteredMembers.length === 0 && <p className="text-center text-gray-600 text-xs py-4 italic">Không tìm thấy hội viên phù hợp</p>}
                  </div>

                  <button
                    onClick={() => {
                      updateCell(selectedCell.rowId, selectedCell.x, selectedCell.y, 'BROKEN');
                      setSelectedCell(null);
                    }}
                    className="w-full border-2 border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <AlertCircle size={18} /> ĐÁNH DẤU HỎNG HÓC
                  </button>
                </div>
              )}

              {/* ĐANG SỬ DỤNG -> GIẢI PHÓNG */}
              {typeof selectedCell.currentValue === 'number' && (
                <div className="space-y-6">
                  <div className="bg-[#39FF14]/5 border border-[#39FF14]/20 p-8 rounded-[2rem] text-center">
                    <User className="mx-auto text-[#39FF14] w-12 h-12 mb-4" />
                    <p className="text-gray-400 text-xs uppercase font-black tracking-widest mb-1">Đang sử dụng bởi</p>
                    <h3 className="text-2xl font-black text-white">
                      {members?.find((m: any) => m.id === selectedCell.currentValue)?.fullName || 'Hội viên ẩn'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      updateCell(selectedCell.rowId, selectedCell.x, selectedCell.y, null);
                      setSelectedCell(null);
                    }}
                    className="w-full bg-[#39FF14] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(57,255,20,0.3)]"
                  >
                    <CheckCircle size={20} /> THU HỒI TỦ (GIẢI PHÓNG)
                  </button>
                </div>
              )}

              {/* ĐANG HỎNG -> SỬA XONG */}
              {selectedCell.currentValue === 'BROKEN' && (
                <div className="space-y-6 text-center">
                  <div className="bg-red-900/10 border border-red-900/30 p-12 rounded-[2rem]">
                    <AlertCircle className="mx-auto text-red-500 w-16 h-16 mb-4 animate-pulse" />
                    <h3 className="text-xl font-black text-red-500 uppercase tracking-tighter">Tủ Đang Bảo Trì</h3>
                    <p className="text-gray-500 text-sm mt-2">Ô tủ này đã được báo hỏng và không thể cấp phát.</p>
                  </div>
                  <button
                    onClick={() => {
                      updateCell(selectedCell.rowId, selectedCell.x, selectedCell.y, null);
                      setSelectedCell(null);
                    }}
                    className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#39FF14] transition-all"
                  >
                    <CheckCircle size={20} /> ĐÃ SỬA XONG - SẴN SÀNG SỬ DỤNG
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
