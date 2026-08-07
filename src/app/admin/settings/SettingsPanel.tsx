'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  whatsappNumber: string;
  linkedinUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  xUrl: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  smtpFromEmail: string;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiSystemPrompt: string;
  siteFavicon: string;
  gaTrackingId: string;
  watermarkEnabled: string;
  watermarkType: string;
  watermarkText: string;
  watermarkImage: string;
  watermarkPosition: string;
  watermarkOpacity: string;
  watermarkSize: string;
  copyProtectionEnabled: string;
  enabledLocales: string;
}

const DEFAULT_AI_PROMPT = `You are the AI assistant for Tsianfan (Xiamen) Industry & Trade Co., Ltd., a professional manufacturer of tile display racks, sample boards, and showroom display systems. We have 17 product series and 172 SKUs, exporting 80% to Europe and North America. Help customers with product information, specifications, and inquiries. Encourage visitors to submit inquiries for detailed quotes. Keep responses concise and professional.`;

export function SettingsPanel() {
  const { data, isLoading } = useSWR('/api/admin/settings', fetcher);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (data?.data) {
      setSettings(data.data);
    }
  }, [data]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('设置保存成功');
        setSettings(result.data);
      } else {
        toast.error(result.message || '保存设置失败');
      }
    } catch {
      toast.error('网络错误，请重试。');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordChange.currentPassword || !passwordChange.newPassword) {
      toast.error('请填写所有密码字段');
      return;
    }
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    if (passwordChange.newPassword.length < 6) {
      toast.error('密码长度至少 6 位');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordChange }),
      });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('密码修改成功');
        setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.message || '修改密码失败');
      }
    } catch {
      toast.error('网络错误，请重试。');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof SiteSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-32 animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle>站点信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>站点名称</Label>
              <Input value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} />
            </div>
            <div>
              <Label>联系邮箱</Label>
              <Input type="email" value={settings.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
            </div>
            <div>
              <Label>联系电话</Label>
              <Input value={settings.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
            </div>
            <div>
              <Label>WhatsApp 号码</Label>
              <Input value={settings.whatsappNumber} onChange={(e) => update('whatsappNumber', e.target.value)} placeholder="+86xxxxxxxxxxx" />
            </div>
          </div>
          <div>
            <Label>联系地址</Label>
            <Input value={settings.contactAddress} onChange={(e) => update('contactAddress', e.target.value)} />
          </div>
          <div>
            <Label>站点描述</Label>
            <Textarea rows={2} value={settings.siteDescription} onChange={(e) => update('siteDescription', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>社交媒体链接</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>LinkedIn 链接</Label>
              <Input value={settings.linkedinUrl} onChange={(e) => update('linkedinUrl', e.target.value)} placeholder="https://www.linkedin.com/company/..." />
            </div>
            <div>
              <Label>Facebook 链接</Label>
              <Input value={settings.facebookUrl} onChange={(e) => update('facebookUrl', e.target.value)} placeholder="https://www.facebook.com/..." />
            </div>
            <div>
              <Label>YouTube 链接</Label>
              <Input value={settings.youtubeUrl} onChange={(e) => update('youtubeUrl', e.target.value)} placeholder="https://www.youtube.com/..." />
            </div>
            <div>
              <Label>Instagram 链接</Label>
              <Input value={settings.instagramUrl} onChange={(e) => update('instagramUrl', e.target.value)} placeholder="https://www.instagram.com/..." />
            </div>
            <div>
              <Label>X (Twitter) 链接</Label>
              <Input value={settings.xUrl} onChange={(e) => update('xUrl', e.target.value)} placeholder="https://www.x.com/..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>SMTP 邮件配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SMTP 主机</Label>
              <Input value={settings.smtpHost} onChange={(e) => update('smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <Label>SMTP 端口</Label>
              <Input value={settings.smtpPort} onChange={(e) => update('smtpPort', e.target.value)} placeholder="587" />
            </div>
            <div>
              <Label>SMTP 用户名</Label>
              <Input value={settings.smtpUsername} onChange={(e) => update('smtpUsername', e.target.value)} />
            </div>
            <div>
              <Label>SMTP 密码</Label>
              <Input type="password" value={settings.smtpPassword} onChange={(e) => update('smtpPassword', e.target.value)} placeholder="留空则保持当前密码" />
            </div>
          </div>
          <div>
            <Label>发件邮箱</Label>
            <Input type="email" value={settings.smtpFromEmail} onChange={(e) => update('smtpFromEmail', e.target.value)} placeholder="noreply@tsianfan.com" />
          </div>
        </CardContent>
      </Card>

      {/* AI Customer Service Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>AI 客服配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>AI 服务商</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={settings.aiProvider}
                onChange={(e) => update('aiProvider', e.target.value)}
              >
                <option value="none">无（基于规则的 FAQ）</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
            <div>
              <Label>AI 模型</Label>
              <Input value={settings.aiModel} onChange={(e) => update('aiModel', e.target.value)} placeholder="gpt-4o" />
            </div>
          </div>
          <div>
            <Label>API Key</Label>
            <Input type="password" value={settings.aiApiKey} onChange={(e) => update('aiApiKey', e.target.value)} placeholder="留空则保持当前密钥" />
          </div>
          <div>
            <Label>系统提示词</Label>
            <Textarea
              rows={6}
              value={settings.aiSystemPrompt || DEFAULT_AI_PROMPT}
              onChange={(e) => update('aiSystemPrompt', e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">
              此字段为空时使用默认提示词。
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">当前 AI 引擎：</span>
            <Badge variant={settings.aiProvider === 'openai' ? 'default' : 'secondary'}>
              {settings.aiProvider === 'openai' ? `OpenAI (${settings.aiModel})` : '基于规则 (FAQ)'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Favicon & Analytics Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>网站图标 & 统计分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>网站图标 URL</Label>
              <Input value={settings.siteFavicon} onChange={(e) => update('siteFavicon', e.target.value)} placeholder="/images/favicon/favicon.ico" />
              <p className="mt-1 text-xs text-gray-400">网站图标文件路径。</p>
            </div>
            <div>
              <Label>Google Analytics 跟踪 ID</Label>
              <Input value={settings.gaTrackingId} onChange={(e) => update('gaTrackingId', e.target.value)} placeholder="G-XXXXXXXXXX" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watermark Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>图片水印</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="watermark-enabled"
              checked={settings.watermarkEnabled === 'true'}
              onChange={(e) => update('watermarkEnabled', e.target.checked ? 'true' : 'false')}
            />
            <label htmlFor="watermark-enabled" className="text-sm font-medium">上传图片时启用水印</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>水印类型</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={settings.watermarkType}
                onChange={(e) => update('watermarkType', e.target.value)}
              >
                <option value="text">文字</option>
                <option value="image">图片</option>
              </select>
            </div>
            <div>
              <Label>位置</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={settings.watermarkPosition}
                onChange={(e) => update('watermarkPosition', e.target.value)}
              >
                <option value="northwest">左上</option>
                <option value="north">上居中</option>
                <option value="northeast">右上</option>
                <option value="west">左居中</option>
                <option value="center">居中</option>
                <option value="east">右居中</option>
                <option value="southwest">左下</option>
                <option value="south">下居中</option>
                <option value="southeast">右下</option>
              </select>
            </div>
            {settings.watermarkType === 'text' ? (
              <div>
                <Label>水印文字</Label>
                <Input value={settings.watermarkText} onChange={(e) => update('watermarkText', e.target.value)} placeholder="TSIANFAN" />
              </div>
            ) : (
              <div>
                <Label>水印图片 URL</Label>
                <Input value={settings.watermarkImage} onChange={(e) => update('watermarkImage', e.target.value)} placeholder="/images/watermark/logo.png" />
              </div>
            )}
            <div>
              <Label>透明度 (0-100)</Label>
              <Input type="number" value={settings.watermarkOpacity} onChange={(e) => update('watermarkOpacity', e.target.value)} min="0" max="100" />
            </div>
            <div>
              <Label>大小（占图片宽度百分比）</Label>
              <Input type="number" value={settings.watermarkSize} onChange={(e) => update('watermarkSize', e.target.value)} min="5" max="100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copy Protection & Locale Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>防复制 & 语言设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="copy-protection-enabled"
              checked={settings.copyProtectionEnabled === 'true'}
              onChange={(e) => update('copyProtectionEnabled', e.target.checked ? 'true' : 'false')}
            />
            <label htmlFor="copy-protection-enabled" className="text-sm font-medium">启用防复制（禁用右键和文字选择）</label>
          </div>
          <div>
            <Label>启用的语言（逗号分隔）</Label>
            <Input value={settings.enabledLocales} onChange={(e) => update('enabledLocales', e.target.value)} placeholder="en,fr,de,it,es" />
            <p className="mt-1 text-xs text-gray-400">控制语言切换器中显示哪些语言。</p>
          </div>
        </CardContent>
      </Card>

      {/* Save button for all settings */}
      <div className="flex justify-end">
        <Button variant="brand" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? '保存中...' : '保存全部设置'}
        </Button>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>当前密码</Label>
            <Input
              type="password"
              value={passwordChange.currentPassword}
              onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>新密码</Label>
              <Input
                type="password"
                value={passwordChange.newPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label>确认新密码</Label>
              <Input
                type="password"
                value={passwordChange.confirmPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <Button variant="outline" onClick={handlePasswordChange} disabled={saving}>
            更新密码
          </Button>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>系统信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">版本：</span>
            <Badge variant="outline">V2.0</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">数据库：</span>
            <span>SQLite (dev)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">AI 引擎：</span>
            <Badge variant={settings.aiProvider === 'openai' ? 'default' : 'secondary'}>
              {settings.aiProvider === 'openai' ? 'OpenAI' : '基于规则 (V2.0)'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
