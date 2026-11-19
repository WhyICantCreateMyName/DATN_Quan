import axiosClient from './axiosClient';
import { CreateInvoiceDto, Invoice, InvoiceQueryParams } from '@/types/pos';
import { PaginationResponse } from '@/types';

export type InvoiceCreateInput = CreateInvoiceDto;

export const posService = {
  createInvoice: (data: CreateInvoiceDto): Promise<Invoice> =>
    axiosClient.post('/pos/invoice', data),

  getInvoices: (params?: InvoiceQueryParams): Promise<PaginationResponse<Invoice>> => {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const memberId = params?.memberId ? `&memberId=${params.memberId}` : '';
    const cashierId = params?.cashierId ? `&cashierId=${params.cashierId}` : '';
    return axiosClient.get(`/pos/invoices?page=${page}&limit=${limit}${memberId}${cashierId}`);
  },

  getInvoiceById: (id: number): Promise<Invoice> =>
    axiosClient.get(`/pos/invoices/${id}`),
};
