import { useState, useEffect, useCallback } from 'react';
import { catalogService } from '@/services/catalogService';
import { MembershipType, ClassType, ProductType, PaginationResponse } from '@/types';
import { useToast } from '@/context/ToastContext';

export const useCatalog = () => {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<PaginationResponse<MembershipType.Plan> | null>(null);
  const [classes, setClasses] = useState<PaginationResponse<ClassType.GroupClass> | null>(null);
  const [products, setProducts] = useState<PaginationResponse<ProductType.Product> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPlans = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await catalogService.getPlans(page);
      setPlans(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await catalogService.getClasses(page);
      setClasses(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await catalogService.getProducts(page);
      setProducts(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchClasses();
    fetchProducts();
  }, [fetchPlans, fetchClasses, fetchProducts]);

  const deleteItem = async (type: 'plan' | 'class' | 'prod', id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    try {
      if (type === 'plan') {
        await catalogService.deletePlan(id);
        fetchPlans();
      } else if (type === 'prod') {
        await catalogService.deleteProduct(id);
        fetchProducts();
      } else if (type === 'class') {
        await catalogService.deleteClass(id);
        fetchClasses();
      }
      showToast('Xóa thành công', 'success');
    } catch (e: any) {
      showToast('Lỗi khi xóa: ' + e.message, 'error');
    }
  };

  return {
    plans,
    classes,
    products,
    loading,
    refreshPlans: fetchPlans,
    refreshClasses: fetchClasses,
    refreshProducts: fetchProducts,
    deleteItem,
    createPlan: catalogService.createPlan,
    updatePlan: catalogService.updatePlan,
    createProduct: catalogService.createProduct,
    updateProduct: catalogService.updateProduct,
    createClass: catalogService.createClass,
    updateClass: catalogService.updateClass
  };
};
