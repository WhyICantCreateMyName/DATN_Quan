'use client';

import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { catalogService } from '@/services/catalogService';
import { productService } from '@/services/productService';
import { posService } from '@/services/posService';
import { checkinService, MemberLookupResponse } from '@/services/checkinService';
import { PosItem, CartItem, CreateInvoiceDto } from '@/types/pos';
import { Toast } from '@/context/ToastContext';

export const usePOS = () => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PLANS' | 'PRODUCTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lockedMember, setLockedMember] = useState<MemberLookupResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch plans
  const { data: plansRes, isLoading: loadingPlans } = useSWR(
    'posPlans',
    async () => {
      try {
        const res = await catalogService.getPlans(1, 100);
        return res.data || [];
      } catch (e) {
        return [];
      }
    },
    { dedupingInterval: 15000, revalidateOnFocus: false }
  );

  // Fetch products
  const { data: productsRes, isLoading: loadingProducts } = useSWR(
    'posProducts',
    async () => {
      try {
        const res = await productService.getProducts({ page: 1, limit: 100 });
        return res.data || [];
      } catch (e) {
        return [];
      }
    },
    { dedupingInterval: 15000, revalidateOnFocus: false }
  );

  // Transform plans and products into unified PosItem list
  const allItems: PosItem[] = useMemo(() => {
    const plans: PosItem[] = (plansRes || []).map((p: any) => ({
      id: `plan_${p.id}`,
      dbId: p.id,
      name: p.name,
      price: p.price,
      type: 'membership',
      tag: p.tag,
      durationDays: p.durationDays,
      ptSessions: p.ptSessions,
    }));

    const prods: PosItem[] = (productsRes || []).map((p: any) => ({
      id: `prod_${p.id}`,
      dbId: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      type: 'retail',
      imageUrl: p.imageUrl,
    }));

    return [...plans, ...prods];
  }, [plansRes, productsRes]);

  // Filter items by category and search
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchCat =
        selectedCategory === 'ALL'
          ? true
          : selectedCategory === 'PLANS'
          ? item.type === 'membership'
          : item.type === 'retail';

      const matchSearch = searchQuery.trim()
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
        : true;

      return matchCat && matchSearch;
    });
  }, [allItems, selectedCategory, searchQuery]);

  // Lookup member by phone
  const lookupMember = async (phone: string) => {
    try {
      const member = await checkinService.lookup(phone.trim());
      setLockedMember(member);
      Toast.show({
        title: 'Đã tìm thấy hội viên',
        message: `${member.name} (Ví PT: ${member.remainingPtSessions} buổi)`,
        variant: 'success',
      });
      return member;
    } catch (e: any) {
      setLockedMember(null);
      Toast.show({
        title: 'Không tìm thấy',
        message: 'Không tìm thấy hội viên với số điện thoại này!',
        variant: 'error',
      });
      throw e;
    }
  };

  // Cart operations
  const addToCart = (item: PosItem) => {
    // If retail, check stock
    if (item.type === 'retail' && (item.stock === undefined || item.stock <= 0)) {
      Toast.show({
        title: 'Hết hàng',
        message: `Mặt hàng "${item.name}" hiện đã hết hàng trong kho!`,
        variant: 'warning',
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        if (item.type === 'retail' && item.stock !== undefined && existing.quantity >= item.stock) {
          Toast.show({
            title: 'Giới hạn tồn kho',
            message: `Kho chỉ còn ${item.stock} sản phẩm "${item.name}"!`,
            variant: 'warning',
          });
          return prev;
        }
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (item.type === 'retail' && item.stock !== undefined && newQty > item.stock) {
              Toast.show({
                title: 'Giới hạn tồn kho',
                message: `Kho chỉ còn ${item.stock} sản phẩm "${item.name}"!`,
                variant: 'warning',
              });
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Total cart amount
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  // Checkout
  const checkout = async (cashierId: number, paymentMethod: string) => {
    if (cart.length === 0) {
      Toast.show({
        title: 'Giỏ hàng trống',
        message: 'Vui lòng chọn ít nhất 1 sản phẩm trước khi thanh toán!',
        variant: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateInvoiceDto = {
        cashierId,
        memberId: lockedMember ? lockedMember.memberId : null,
        paymentMethod,
        items: cart.map((i) => ({
          price: i.price,
          quantity: i.quantity,
          planId: i.type === 'membership' ? i.dbId : undefined,
          productId: i.type === 'retail' ? i.dbId : undefined,
        })),
      };

      const invoice = await posService.createInvoice(payload);

      Toast.show({
        title: 'Thanh toán thành công',
        message: `Hóa đơn #${invoice.id} đã hoàn tất. Đã tự động cập nhật kho & doanh số!`,
        variant: 'success',
      });

      // Clear state and revalidate products
      setCart([]);
      setLockedMember(null);
      mutate('posProducts');
      mutate((key: any) => Array.isArray(key) && key[0] === 'products', undefined, { revalidate: true });
      mutate((key: any) => Array.isArray(key) && key[0] === 'users', undefined, { revalidate: true });

      return invoice;
    } catch (error: any) {
      Toast.show({
        title: 'Thanh toán thất bại',
        message: error?.response?.data?.error || error?.message || 'Có lỗi khi tạo hóa đơn!',
        variant: 'error',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    items: filteredItems,
    allItems,
    cart,
    lockedMember,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isLoading: loadingPlans || loadingProducts,
    isSubmitting,
    totalAmount,
    lookupMember,
    setLockedMember,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
  };
};
