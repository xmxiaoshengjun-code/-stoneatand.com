import { z } from 'zod';

/**
 * Zod validation schema for inquiry submission.
 */
export const inquiryCreateSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().max(50).optional().or(z.literal('')),
  company: z.string().max(200).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  productId: z.number().int().positive().optional(),
  productSku: z.string().max(20).optional().or(z.literal('')),
  quantity: z.number().int().min(1).max(100000).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  source: z.string().max(200).optional().or(z.literal('')),
});

export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;

/**
 * Zod validation schema for inquiry status update.
 */
export const inquiryUpdateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'NEGOTIATING', 'WON', 'LOST']),
  assignedTo: z.string().max(100).optional(),
  customerId: z.number().int().positive().optional(),
});

export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>;

/**
 * Zod validation schema for follow-up creation.
 */
export const followUpCreateSchema = z.object({
  inquiryId: z.number().int().positive().optional(),
  customerId: z.number().int().positive().optional(),
  type: z.enum(['EMAIL', 'PHONE', 'MEETING', 'OTHER']).default('EMAIL'),
  content: z.string().min(2, 'Content must be at least 2 characters').max(2000),
  nextFollowUpDate: z.string().datetime().optional().or(z.literal('')),
  createdBy: z.string().max(100).optional(),
});

export type FollowUpCreateInput = z.infer<typeof followUpCreateSchema>;

/**
 * Zod validation schema for customer update.
 */
export const customerUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(50).optional().or(z.literal('')),
  company: z.string().max(200).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  tag: z.enum(['BRAND_BUYER', 'DESIGNER', 'DISTRIBUTOR', 'OTHER']).optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
});

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
