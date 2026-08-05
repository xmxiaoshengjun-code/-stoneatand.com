import { prisma } from '@/lib/prisma';

/**
 * FormField Service - manages inquiry form field configuration.
 * Uses raw SQL because the InquiryFormField model cannot be regenerated
 * via prisma generate in the current sandbox environment.
 */

export interface InquiryFormFieldRow {
  id: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: number;
  isActive: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryFormField {
  id: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Converts a raw database row (0/1 integers) to a typed object. */
function toField(row: InquiryFormFieldRow): InquiryFormField {
  return {
    id: row.id,
    fieldName: row.fieldName,
    fieldLabel: row.fieldLabel,
    fieldType: row.fieldType,
    isRequired: row.isRequired === 1,
    isActive: row.isActive === 1,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class FormFieldService {
  /** Retrieves all form field configurations ordered by sortOrder. */
  async getAll(): Promise<InquiryFormField[]> {
    const rows = await prisma.$queryRawUnsafe<InquiryFormFieldRow[]>(
      'SELECT id, fieldName, fieldLabel, fieldType, isRequired, isActive, sortOrder, createdAt, updatedAt FROM InquiryFormField ORDER BY sortOrder ASC'
    );
    return rows.map(toField);
  }

  /** Retrieves only active fields for public-facing form rendering. */
  async getActiveFields(): Promise<
    Array<Pick<InquiryFormField, 'fieldName' | 'fieldLabel' | 'fieldType' | 'isRequired' | 'sortOrder'>>
  > {
    const rows = await prisma.$queryRawUnsafe<InquiryFormFieldRow[]>(
      'SELECT id, fieldName, fieldLabel, fieldType, isRequired, isActive, sortOrder, createdAt, updatedAt FROM InquiryFormField WHERE isActive = 1 ORDER BY sortOrder ASC'
    );
    return rows.map((r) => ({
      fieldName: r.fieldName,
      fieldLabel: r.fieldLabel,
      fieldType: r.fieldType,
      isRequired: r.isRequired === 1,
      sortOrder: r.sortOrder,
    }));
  }

  /** Batch-updates field configurations (isActive + sortOrder). */
  async updateFields(
    fields: Array<{ id: number; isActive?: boolean; sortOrder?: number }>
  ): Promise<InquiryFormField[]> {
    const now = new Date().toISOString();
    for (const field of fields) {
      if (field.isActive !== undefined) {
        await prisma.$executeRawUnsafe(
          'UPDATE InquiryFormField SET isActive = ?, updatedAt = ? WHERE id = ?',
          field.isActive ? 1 : 0,
          now,
          field.id
        );
      }
      if (field.sortOrder !== undefined) {
        await prisma.$executeRawUnsafe(
          'UPDATE InquiryFormField SET sortOrder = ?, updatedAt = ? WHERE id = ?',
          field.sortOrder,
          now,
          field.id
        );
      }
    }
    return this.getAll();
  }

  /** Updates a single field's full configuration. */
  async updateField(
    id: number,
    data: { fieldLabel?: string; fieldType?: string; isRequired?: boolean }
  ): Promise<InquiryFormField | null> {
    const now = new Date().toISOString();
    if (data.fieldLabel !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE InquiryFormField SET fieldLabel = ?, updatedAt = ? WHERE id = ?',
        data.fieldLabel,
        now,
        id
      );
    }
    if (data.fieldType !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE InquiryFormField SET fieldType = ?, updatedAt = ? WHERE id = ?',
        data.fieldType,
        now,
        id
      );
    }
    if (data.isRequired !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE InquiryFormField SET isRequired = ?, updatedAt = ? WHERE id = ?',
        data.isRequired ? 1 : 0,
        now,
        id
      );
    }
    const rows = await prisma.$queryRawUnsafe<InquiryFormFieldRow[]>(
      'SELECT id, fieldName, fieldLabel, fieldType, isRequired, isActive, sortOrder, createdAt, updatedAt FROM InquiryFormField WHERE id = ?',
      id
    );
    return rows.length > 0 ? toField(rows[0]) : null;
  }
}

export const formFieldService = new FormFieldService();
