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
      toast.error('分类、问题和答案不能为空');
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
        toast.success(isEdit ? 'FAQ 更新成功' : 'FAQ 创建成功');
        onSaved();
        onClose();
      } else {
        toast.error(data.message || '保存 FAQ 失败');
      }
    } catch {
      toast.error('网络错误，请重试。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{form.id ? '编辑 FAQ' : '新建 FAQ'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>分类 *</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="例如：产品、物流、价格"
              />
            </div>
            <div>
              <Label>排序权重</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label>问题 *</Label>
            <Input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="请输入问题"
            />
          </div>
          <div>
            <Label>答案 *</Label>
            <Textarea
              rows={5}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="请输入答案"
            />
          </div>
          <div>
            <Label>关键词（逗号分隔，用于 AI 客服匹配）</Label>
            <Input
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="例如：物流、配送、运费、快递"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button variant="brand" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存 FAQ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
