'use client';

import { useState } from 'react';
import { X, Package, DollarSign, Layers, Camera } from 'lucide-react';
import { CreateProductDto } from '@/types/product';
import { useProductMutations } from '@/hooks/useProducts';
import { uploadService } from '@/services/uploadService';
import { Toast } from '@/context/ToastContext';

interface ModalCreateProductProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCreateProduct({ isOpen, onClose }: ModalCreateProductProps) {
  const { createProduct, isCreatingProduct } = useProductMutations();
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<CreateProductDto>({
    name: '',
    price: 50000,
    stock: 50,
    imageUrl: '',
  });

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadService.uploadFile(file);
      setForm((prev) => ({ ...prev, imageUrl: res.url }));
      Toast.show({
        title: 'Tải ảnh thành công',
        message: 'Đã tải lên hình ảnh sản phẩm!',
        variant: 'success',
      });
    } catch (err: any) {
      Toast.show({
        title: 'Lỗi tải ảnh',
        message: err.message || 'Không thể upload ảnh sản phẩm!',
        variant: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      await createProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      onClose();
    } catch (err) {
      // Handled by Toast in hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="p-6 border-b border-[#E4E4E0] flex justify-between items-center bg-[#F7F7F5]/50">
          <div>
            <h3 className="text-xl font-bold text-[#18181B] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span>
              Nhập Hàng Hóa Mới
            </h3>
            <p className="text-sm text-[#6E6E77] mt-0.5">
              Thêm mặt hàng bán lẻ vào kho TitanGym
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6E6E77] hover:text-[#18181B] p-2 hover:bg-[#F7F7F5] rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Image */}
          <div className="flex items-center gap-4 p-3 bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-[#FFFFFF] border border-[#E4E4E0] overflow-hidden flex items-center justify-center shrink-0">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Package size={24} className="text-[#6E6E77]" />
              )}
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#18181B] block mb-1">
                Ảnh Sản Phẩm
              </label>
              <input
                type="file"
                accept="image/*"
                id="modal-prod-img"
                className="hidden"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="modal-prod-img"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F7F7F5] border border-[#E4E4E0] rounded-lg text-xs font-medium text-[#18181B] cursor-pointer shadow-xs transition"
              >
                <Camera size={13} />
                {uploading ? 'Đang tải...' : 'Chọn ảnh từ máy'}
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6E77] block mb-1.5">
              Tên Mặt Hàng *
            </label>
            <div className="relative">
              <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={16} />
              <input
                required
                type="text"
                placeholder="VD: Nước khoáng Pocari 500ml, Whey Gold 5Lbs"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18181B] focus:border-[#EA580C] focus:bg-[#FFFFFF] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6E77] block mb-1.5">
                Giá Bán Lẻ (VNĐ) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={16} />
                <input
                  required
                  type="number"
                  min="0"
                  step="1000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18181B] font-mono focus:border-[#EA580C] focus:bg-[#FFFFFF] outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6E77] block mb-1.5">
                Số Lượng Tồn Kho *
              </label>
              <div className="relative">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={16} />
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18181B] font-mono focus:border-[#EA580C] focus:bg-[#FFFFFF] outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E4E4E0]">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreatingProduct || uploading}
              className="px-5 py-2.5 text-sm font-medium text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isCreatingProduct || uploading}
              className="px-6 py-2.5 text-sm font-semibold bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isCreatingProduct ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Đang Nhập Kho...
                </>
              ) : (
                'Nhập Hàng Vào Kho'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
