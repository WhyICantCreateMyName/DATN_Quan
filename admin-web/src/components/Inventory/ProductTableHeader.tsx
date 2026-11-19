'use client';

export default function ProductTableHeader() {
  return (
    <thead className="bg-[#F7F7F5] border-b border-[#E4E4E0] text-[11px] font-semibold text-[#6E6E77] uppercase tracking-wider">
      <tr>
        <th className="py-3 px-4 text-left">Mặt Hàng</th>
        <th className="py-3 px-4 text-left">Giá Bán Lẻ</th>
        <th className="py-3 px-4 text-left">Tồn Kho</th>
        <th className="py-3 px-4 text-left">Tình Trạng Kho</th>
        <th className="py-3 px-4 text-right">Thao Tác</th>
      </tr>
    </thead>
  );
}
