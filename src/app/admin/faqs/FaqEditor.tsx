'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface FaqFormData {
  id?: number;
  category: string;
  question: string;
  answer: string;
  keywords: string;
  sortOrder: number;
}

interface FaqEditorProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: FaqFormData | null;
}

const EMPTY_FORM: FaqFormData = {
  category: '',
  question: '',
  answer: '',
  keywords: '',
  sortOrder: 0,
};

export function FaqEditor({ open, onClose, onSaved, initialData }: FaqEditorProps) {
  const [form, setForm] = useState<FaqFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData, open]);

  const handleSave = async () => {
    if (!form.category.trim() || !form.question.trim() || !form.answer.trim()) {
      toast.error('Category, question, and answer are required');
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const url = isEdit ? `/api/admin/faqs/${form.id}` : '/api/admin/faqs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          question: form.question,
          answer: form.answer,
          keywords: form.keywords || undefined,
          sortOrder: form.sortOrder,
        }),
      });

      const data = await res.json();
      if (data.code === 200 || data.code === 201) {
        toast.success(isEdit ? 'FAQ updated' : 'FAQ created');
        onSaved();
        onClose();
      } else {
        toast.error(data.message || 'Failed to save FAQ');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit FAQ' : 'New FAQ'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g., Products, Shipping, Pricing"
              />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label>Question *</Label>
            <Input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="What is the question?"
            />
          </div>
          <div>
            <Label>Answer *</Label>
            <Textarea
              rows={5}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="The answer to the question"
            />
          </div>
          <div>
            <Label>Keywords (comma-separated, for AI chat matching)</Label>
            <Input
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="e.g., shipping, delivery, freight, logistics"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="brand" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save FAQ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
