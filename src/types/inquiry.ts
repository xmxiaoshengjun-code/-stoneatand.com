/**
 * Inquiry and CRM-related TypeScript types.
 */

export type InquiryStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'NEGOTIATING' | 'WON' | 'LOST';
export type CustomerTag = 'BRAND_BUYER' | 'DESIGNER' | 'DISTRIBUTOR' | 'OTHER';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type FollowUpType = 'EMAIL' | 'PHONE' | 'MEETING' | 'OTHER';

export interface Inquiry {
  id: number;
  inquiryNo: string;
  customerName: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  productId: number | null;
  productSku: string | null;
  quantity: number | null;
  message: string;
  source: string | null;
  status: InquiryStatus;
  assignedTo: string | null;
  customerId: number | null;
  createdAt: string;
  updatedAt: string;
  product?: Product | null;
  customer?: Customer | null;
  followUps?: FollowUp[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  address: string | null;
  tag: CustomerTag;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  inquiries?: Inquiry[];
  followUps?: FollowUp[];
}

export interface FollowUp {
  id: number;
  customerId: number | null;
  inquiryId: number | null;
  type: FollowUpType;
  content: string;
  nextFollowUpDate: string | null;
  createdBy: string | null;
  createdAt: string;
  customer?: Customer | null;
  inquiry?: Inquiry | null;
}

export interface InquiryListResponse {
  items: Inquiry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

import type { Product } from './product';
