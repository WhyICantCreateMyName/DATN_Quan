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
  const { members } = useMembers();

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
    const xStr = x.toString();
    const yStr = (y + 1).toString().padStart(2, '0');
    return `${rowName}${xStr}${yStr}`;
  };

  const filteredMembers = members?.filter((m: any) =>
    m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.phone.includes(memberSearch)
  ).slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Hệ Thống Tủ Đồ (Locker)</h1>
          <p className="text-xs text-[#6E6E77] mt-1">
            Quản lý cấp phát tủ đồ, theo dõi trạng thái sử dụng và bảo trì các dãy tủ phòng tập.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <PlusCircle size={16} /> Thiết Lập Dãy Mới
        </button>
      </div>

      {/* Rows Container */}
      <div className="space-y-6">
        {loading && (
          <div className="text-center py-16 text-xs font-mono text-[#6E6E77] animate-pulse">
            Đang đồng bộ trạng thái hệ thống tủ đồ...
          </div>
        )}

        {lockerRows && lockerRows.map((row) => (
          <div key={row.id} className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#E4E4E0] bg-[#F7F7F5] flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
                  <LayoutGrid className="text-[#EA580C] w-5 h-5" />
                  Dãy Locker {row.name}
                </h3>
                <p className="text-[11px] font-mono text-[#6E6E77] mt-0.5">
                  Quy mô: {row.rowCount} hàng x {row.colCount} cột • Tổng {row.rowCount * row.colCount} ô
                </p>
              </div>
              <button
                onClick={() => deleteRow(row.id)}
                className="p-1.5 text-[#6E6E77] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Xóa dãy tủ"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="p-6 overflow-x-auto">
              <div
                className="grid gap-2.5"
                style={{
                  gridTemplateColumns: `repeat(${row.colCount}, minmax(84px, 1fr))`,
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
                          aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all relative group cursor-pointer p-2
                          ${!cell ? 'border-[#E4E4E0] bg-[#F7F7F5] hover:border-[#EA580C] text-[#6E6E77]' : ''}
                          ${isOccupied ? 'border-green-200 bg-green-50 text-[#15803D]' : ''}
                          ${isBroken ? 'border-red-200 bg-red-50 text-red-600' : ''}
                        `}
                      >
                        <span className="text-[10px] font-mono font-bold absolute top-1.5 left-2 opacity-60">
                          {getCellName(row.name, x, y)}
                        </span>

                        {!cell && <Box size={20} className="group-hover:scale-110 transition-transform text-[#6E6E77]" />}
                        {isOccupied && <User size={20} className="text-[#15803D]" />}
                        {isBroken && <AlertCircle size={20} className="text-red-600" />}

                        <span className="text-[10px] font-bold text-center line-clamp-1 px-0.5">
                          {!cell && 'Trống'}
                          {isOccupied && (member?.fullName ? member.fullName.split(' ').slice(-1)[0] : `ID:${cell}`)}
                          {isBroken && 'Hỏng'}
                        </span>
                      </button>
                    );
                  })
                ))}
              </div>
            </div>

            <div className="px-6 py-3 bg-[#F7F7F5] border-t border-[#E4E4E0] flex gap-6 text-xs">
              <div className="flex items-center gap-2 text-[#6E6E77]">
                <div className="w-3 h-3 rounded-sm bg-[#FFFFFF] border border-[#E4E4E0]"></div> Sẵn sàng
              </div>
              <div className="flex items-center gap-2 text-[#15803D] font-medium">
                <div className="w-3 h-3 rounded-sm bg-green-500"></div> Đang sử dụng
              </div>
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <div className="w-3 h-3 rounded-sm bg-red-500"></div> Đang bảo trì
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL THÊM DÃY MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] border border-[#E4E4E0] w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E0] mb-5">
              <div className="flex items-center gap-2">
                <LayoutGrid className="text-[#EA580C] w-5 h-5" />
                <h3 className="font-bold text-[#18181B] text-base">Thiết Lập Dãy Tủ Mới</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRow} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#18181B] mb-1.5 block">
                  Tên dãy tủ <span className="text-[#EA580C]">*</span>
                </label>
                <input
                  required
                  value={newRow.name}
                  onChange={e => setNewRow({ ...newRow, name: e.target.value })}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3.5 py-2.5 text-xs text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
                  placeholder="VD: A, B, VIP..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#18181B] mb-1.5 block">Số hàng (X)</label>
                  <input
                    type="number"
                    min="1"
                    value={newRow.rowCount}
                    onChange={e => setNewRow({ ...newRow, rowCount: Number(e.target.value) })}
                    className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#18181B] mb-1.5 block">Số cột (Y)</label>
                  <input
                    type="number"
                    min="1"
                    value={newRow.colCount}
                    onChange={e => setNewRow({ ...newRow, colCount: Number(e.target.value) })}
                    className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E4E4E0] text-xs font-bold text-[#6E6E77] hover:bg-[#F7F7F5] rounded-xl transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EA580C] text-white font-bold text-xs rounded-xl hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer"
                >
                  Tạo Dãy Tủ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT Ô LOCKER */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] border border-[#E4E4E0] w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedCell(null)}
              className="absolute top-5 right-5 text-[#6E6E77] hover:text-[#18181B] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#EA580C] uppercase tracking-wider">Cấu Hình Ô Tủ</span>
              <h2 className="text-2xl font-mono font-black text-[#18181B] mt-0.5">
                {getCellName(lockerRows.find(r => r.id === selectedCell.rowId)?.name || '', selectedCell.x, selectedCell.y)}
              </h2>
            </div>

            <div className="space-y-4">
              {/* TRẠNG THÁI TRỐNG -> GÁN CHO HỘI VIÊN */}
              {!selectedCell.currentValue && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77] w-4 h-4" />
                    <input
                      className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#18181B] placeholder-[#6E6E77] focus:outline-hidden focus:border-[#EA580C]"
                      placeholder="Tìm hội viên gán tủ (Tên hoặc SĐT)..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredMembers.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          updateCell(selectedCell.rowId, selectedCell.x, selectedCell.y, m.id);
                          setSelectedCell(null);
                          setMemberSearch('');
                        }}
                        className="w-full bg-[#F7F7F5] hover:bg-orange-50 hover:border-orange-200 border border-[#E4E4E0] p-3 rounded-xl flex justify-between items-center transition-all cursor-pointer text-left"
                      >
                        <span className="font-bold text-xs text-[#18181B]">{m.fullName}</span>
                        <span className="text-[11px] font-mono text-[#6E6E77]">{m.phone}</span>
                      </button>
                    ))}
                    {memberSearch && filteredMembers.length === 0 && (
                      <p className="text-center text-[#6E6E77] text-xs py-4 italic">Không tìm thấy hội viên phù hợp</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      updateCell(selectedCell.rowId, selectedCell.x, selectedCell.y, 'BROKEN');
                      setSelectedCell(null);
                    }}
                    className="w-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <AlertCircle size={16} /> Báo Hỏng Ô Tủ Này
                  </button>
                </div>
              )}

              {/* ĐANG SỬ DỤNG -> GIẢI PHÓNG */}
              {typeof selectedCell.currentValue === 'number' && (
                <div className="space-y-4 text-center">
                  <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
                    <User className="mx-auto text-[#15803D] w-10 h-10 mb-2" />
                    <p className="text-[#6E6E77] text-[11px] uppercase font-bold tracking-wider">Đang sử dụng bởi</p>
                    <h3 className="text-lg font-bold text-[#18181B] mt-1">
                      {members?.find((m: any) => m.id === selectedCell.currentValue)?.fullName || 'Hội viên'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      updateCell(selectedCell.rowId, selectedCell.x, selectedCell.y, null);
                      setSelectedCell(null);
                    }}
                    className="w-full bg-[#EA580C] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all text-xs cursor-pointer"
                  >
                    <CheckCircle size={16} /> Thu Hồi & Giải Phóng Ô Tủ
                  </button>
                </div>
              )}

              {/* ĐANG HỎNG -> SỬA XONG */}
              {selectedCell.currentValue === 'BROKEN' && (
                <div className="space-y-4 text-center">
                  <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
                    <AlertCircle className="mx-auto text-red-600 w-10 h-10 mb-2" />
                    <h3 className="text-base font-bold text-red-700">Ô Tủ Đang Báo Hỏng</h3>
                    <p className="text-[#6E6E77] text-xs mt-1">Ô tủ đang trong trạng thái bảo trì và tạm khóa.</p>
                  </div>
                  <button
                    onClick={() => {
                      updateCell(selectedCell.rowId, selectedCell.x, selectedCell.y, null);
                      setSelectedCell(null);
                    }}
                    className="w-full bg-[#15803D] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#15803D]/90 shadow-sm shadow-[#15803D]/20 transition-all text-xs cursor-pointer"
                  >
                    <CheckCircle size={16} /> Đã Khắc Phục - Mở Lại Ô Tủ
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
