import { Product } from './product';
import { MembershipPlan } from './membership';
import { User } from './user';

export type PosItemType = 'membership' | 'retail';

export interface PosItem {
  id: string; // 'plan_1' or 'prod_1'
  dbId: number;
  name: string;
  price: number;
  stock?: number;
  type: PosItemType;
  tag?: string | null;
  imageUrl?: string | null;
  durationDays?: number;
  ptSessions?: number;
}

export interface CartItem extends PosItem {
  quantity: number;
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  planId?: number | null;
  productId?: number | null;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  plan?: MembershipPlan;
  product?: Product;
}

export interface Invoice {
  id: number;
  cashierId: number;
  memberId?: number | null;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'MOMO';
  createdAt: string;
  items: InvoiceItem[];
  cashier?: Partial<User>;
  member?: {
    id: number;
    user?: Partial<User>;
  };
}

export interface CreateInvoiceDto {
  cashierId: number;
  memberId?: number | null;
  paymentMethod: string;
  items: {
    productId?: number;
    planId?: number;
    price: number;
    quantity: number;
  }[];
}

export type InvoiceCreateInput = CreateInvoiceDto;

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  memberId?: number;
  cashierId?: number;
}
