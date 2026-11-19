'use client';

import React from 'react';

export default function StaffTableHeader() {
  return (
    <thead className="bg-[#F7F7F5] border-b border-[#E4E4E0] text-[11px] font-bold text-[#6E6E77] uppercase tracking-wider">
      <tr>
        <th className="px-6 py-3.5 text-left">Nhân Sự</th>
        <th className="px-6 py-3.5 text-left font-mono">Số Điện Thoại</th>
        <th className="px-6 py-3.5 text-left">Vai Trò</th>
        <th className="px-6 py-3.5 text-left">Chuyên Môn</th>
        <th className="px-6 py-3.5 text-left">Trạng Thái</th>
        <th className="px-6 py-3.5 text-right">Thao Tác</th>
      </tr>
    </thead>
  );
}
