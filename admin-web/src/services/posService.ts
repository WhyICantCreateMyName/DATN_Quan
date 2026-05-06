import axiosClient from './axiosClient';

export interface InvoiceItemInput {
  price: number;
  quantity: number;
  planId?: number;
  productId?: number;
}

export interface InvoiceCreateInput {
  cashierId: number;
  memberId: number | null;
  paymentMethod: string;
  items: InvoiceItemInput[];
}

export const posService = {
  createInvoice: (data: InvoiceCreateInput): Promise<any> => 
    axiosClient.post('/pos/invoice', data),
};
