import { useState, useEffect, useCallback } from 'react';
import { catalogService } from '@/services/catalogService';
import { posService, InvoiceCreateInput } from '@/services/posService';
import { checkinService, MemberLookupResponse } from '@/services/checkinService';
import { Tag, Dumbbell } from 'lucide-react';

export const usePOS = () => {
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [lockedMember, setLockedMember] = useState<MemberLookupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, page: 1 });

  const fetchItems = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const [plansRes, productsRes] = await Promise.all([
        catalogService.getPlans(1, 100), // Lấy hết plans để bán
        catalogService.getProducts(page, 30)
      ]);

      const plans = plansRes.data.map(p => ({
        id: `plan_${p.id}`, dbId: p.id, name: p.name, price: p.price, type: 'membership', icon: Tag 
      }));
      
      const prods = productsRes.data.map(p => ({
        id: `prod_${p.id}`, dbId: p.id, name: p.name, price: p.price, type: 'retail', icon: Dumbbell, imageUrl: p.imageUrl 
      }));

      setPagination({ totalPages: Math.ceil(productsRes.total / productsRes.limit), page: productsRes.page });

      if (page === 1) {
        setItems([...plans, ...prods]);
      } else {
        setItems(prods);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const lookupMember = async (phone: string) => {
    const member = await checkinService.lookup(phone);
    setLockedMember(member);
    return member;
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const checkout = async (cashierId: number, paymentMethod: string) => {
    const payload: InvoiceCreateInput = {
      cashierId,
      memberId: lockedMember ? lockedMember.memberId : null,
      paymentMethod,
      items: cart.map(i => ({
        price: i.price,
        quantity: i.qty,
        planId: i.type === 'membership' ? i.dbId : undefined,
        productId: i.type === 'retail' ? i.dbId : undefined
      }))
    };
    await posService.createInvoice(payload);
    setCart([]);
    setLockedMember(null);
  };

  useEffect(() => {
    fetchItems(1);
  }, [fetchItems]);

  return {
    items,
    cart,
    lockedMember,
    loading,
    pagination,
    setPage: fetchItems,
    lookupMember,
    setLockedMember,
    addToCart,
    removeFromCart,
    checkout,
    total: cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  };
};
