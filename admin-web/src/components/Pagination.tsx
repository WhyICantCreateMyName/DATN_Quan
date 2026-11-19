'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalItems, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / limit);
  
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-9 h-9 rounded-lg text-xs font-mono font-bold transition-colors ${
            currentPage === i 
              ? 'bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/20' 
              : 'bg-[#FFFFFF] border border-[#E4E4E0] text-[#6E6E77] hover:bg-[#F7F7F5] hover:text-[#18181B]'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const startIdx = (currentPage - 1) * limit + 1;
  const endIdx = Math.min(currentPage * limit, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#FFFFFF] border-t border-[#E4E4E0]">
      <p className="text-xs text-[#6E6E77] font-medium">
        Hiển thị <span className="font-mono font-bold text-[#18181B]">{startIdx} - {endIdx}</span> trên tổng số <span className="font-mono font-bold text-[#18181B]">{totalItems}</span> bản ghi
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#FFFFFF] border border-[#E4E4E0] text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#FFFFFF] border border-[#E4E4E0] text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
