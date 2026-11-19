'use client';

export default function PlanTableHeader() {
  return (
    <thead className="bg-[#F7F7F5] border-b border-[#E4E4E0] text-[11px] font-semibold text-[#6E6E77] uppercase tracking-wider">
      <tr>
        <th className="py-3 px-4 text-left">Gói Tập</th>
        <th className="py-3 px-4 text-left">Phân Khúc</th>
        <th className="py-3 px-4 text-left">Giá Niêm Yết</th>
        <th className="py-3 px-4 text-left">Thời Hạn</th>
        <th className="py-3 px-4 text-left">Buổi Kèm PT</th>
        <th className="py-3 px-4 text-left">Trạng Thái</th>
        <th className="py-3 px-4 text-right">Thao Tác</th>
      </tr>
    </thead>
  );
}
