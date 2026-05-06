import axiosClient from './axiosClient';
import { MembershipType, ClassType, ProductType, PaginationResponse } from '@/types';

export const catalogService = {
  // Membership Plans
  getPlans: (page = 1, limit = 10): Promise<PaginationResponse<MembershipType.Plan>> => 
    axiosClient.get(`/memberships/plans?page=${page}&limit=${limit}`),
  
  createPlan: (data: MembershipType.PlanCreateInput): Promise<MembershipType.Plan> => 
    axiosClient.post('/memberships/plans', data),
  
  deletePlan: (id: number): Promise<void> => 
    axiosClient.delete(`/memberships/plans/${id}`),

  updatePlan: (id: number, data: Partial<MembershipType.PlanCreateInput>): Promise<MembershipType.Plan> =>
    axiosClient.patch(`/memberships/plans/${id}`, data),

  // Group Classes
  getClasses: (page = 1, limit = 10): Promise<PaginationResponse<ClassType.GroupClass>> => 
    axiosClient.get(`/bookings/classes?page=${page}&limit=${limit}`),
  
  createClass: (data: ClassType.ClassCreateInput): Promise<ClassType.GroupClass> => 
    axiosClient.post('/bookings/classes', data),

  updateClass: (id: number, data: Partial<ClassType.ClassCreateInput>): Promise<ClassType.GroupClass> =>
    axiosClient.patch(`/bookings/classes/${id}`, data),
  
  deleteClass: (id: number): Promise<void> => 
    axiosClient.delete(`/bookings/classes/${id}`),

  // Products
  getProducts: (page = 1, limit = 10): Promise<PaginationResponse<ProductType.Product>> => 
    axiosClient.get(`/pos/products?page=${page}&limit=${limit}`),
  
  createProduct: (data: ProductType.ProductCreateInput): Promise<ProductType.Product> => 
    axiosClient.post('/pos/products', data),

  updateProduct: (id: number, data: Partial<ProductType.ProductCreateInput>): Promise<ProductType.Product> =>
    axiosClient.patch(`/pos/products/${id}`, data),
  
  deleteProduct: (id: number): Promise<void> => 
    axiosClient.delete(`/pos/products/${id}`),
};
