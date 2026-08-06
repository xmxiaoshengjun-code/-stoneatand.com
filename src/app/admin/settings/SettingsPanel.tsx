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
        toast.success('Settings saved successfully');
        setSettings(result.data);
      } else {
        toast.error(result.message || 'Failed to save settings');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordChange.currentPassword || !passwordChange.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordChange.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
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
        toast.success('Password updated successfully');
        setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.message || 'Failed to update password');
      }
    } catch {
      toast.error('Network error. Please try again.');
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
          <CardTitle>Site Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Site Name</Label>
              <Input value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input type="email" value={settings.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input value={settings.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <Input value={settings.whatsappNumber} onChange={(e) => update('whatsappNumber', e.target.value)} placeholder="+86xxxxxxxxxxx" />
            </div>
          </div>
          <div>
            <Label>Contact Address</Label>
            <Input value={settings.contactAddress} onChange={(e) => update('contactAddress', e.target.value)} />
          </div>
          <div>
            <Label>Site Description</Label>
            <Textarea rows={2} value={settings.siteDescription} onChange={(e) => update('siteDescription', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>LinkedIn URL</Label>
              <Input value={settings.linkedinUrl} onChange={(e) => update('linkedinUrl', e.target.value)} placeholder="https://www.linkedin.com/company/..." />
            </div>
            <div>
              <Label>Facebook URL</Label>
              <Input value={settings.facebookUrl} onChange={(e) => update('facebookUrl', e.target.value)} placeholder="https://www.facebook.com/..." />
            </div>
            <div>
              <Label>YouTube URL</Label>
              <Input value={settings.youtubeUrl} onChange={(e) => update('youtubeUrl', e.target.value)} placeholder="https://www.youtube.com/..." />
            </div>
            <div>
              <Label>Instagram URL</Label>
              <Input value={settings.instagramUrl} onChange={(e) => update('instagramUrl', e.target.value)} placeholder="https://www.instagram.com/..." />
            </div>
            <div>
              <Label>X (Twitter) URL</Label>
              <Input value={settings.xUrl} onChange={(e) => update('xUrl', e.target.value)} placeholder="https://www.x.com/..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SMTP Host</Label>
              <Input value={settings.smtpHost} onChange={(e) => update('smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <Label>SMTP Port</Label>
              <Input value={settings.smtpPort} onChange={(e) => update('smtpPort', e.target.value)} placeholder="587" />
            </div>
            <div>
              <Label>SMTP Username</Label>
              <Input value={settings.smtpUsername} onChange={(e) => update('smtpUsername', e.target.value)} />
            </div>
            <div>
              <Label>SMTP Password</Label>
              <Input type="password" value={settings.smtpPassword} onChange={(e) => update('smtpPassword', e.target.value)} placeholder="Leave empty to keep current" />
            </div>
          </div>
          <div>
            <Label>From Email</Label>
            <Input type="email" value={settings.smtpFromEmail} onChange={(e) => update('smtpFromEmail', e.target.value)} placeholder="noreply@tsianfan.com" />
          </div>
        </CardContent>
      </Card>

      {/* AI Customer Service Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>AI Customer Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>AI Provider</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={settings.aiProvider}
                onChange={(e) => update('aiProvider', e.target.value)}
              >
                <option value="none">None (Rule-based FAQ)</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
            <div>
              <Label>AI Model</Label>
              <Input value={settings.aiModel} onChange={(e) => update('aiModel', e.target.value)} placeholder="gpt-4o" />
            </div>
          </div>
          <div>
            <Label>API Key</Label>
            <Input type="password" value={settings.aiApiKey} onChange={(e) => update('aiApiKey', e.target.value)} placeholder="Leave empty to keep current" />
          </div>
          <div>
            <Label>System Prompt</Label>
            <Textarea
              rows={6}
              value={settings.aiSystemPrompt || DEFAULT_AI_PROMPT}
              onChange={(e) => update('aiSystemPrompt', e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">
              Default prompt is used if this field is empty.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Current AI Engine:</span>
            <Badge variant={settings.aiProvider === 'openai' ? 'default' : 'secondary'}>
              {settings.aiProvider === 'openai' ? `OpenAI (${settings.aiModel})` : 'Rule-based (FAQ)'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Favicon & Analytics Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Favicon & Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Favicon URL</Label>
              <Input value={settings.siteFavicon} onChange={(e) => update('siteFavicon', e.target.value)} placeholder="/images/favicon/favicon.ico" />
              <p className="mt-1 text-xs text-gray-400">Path to favicon image file.</p>
            </div>
            <div>
              <Label>Google Analytics Tracking ID</Label>
              <Input value={settings.gaTrackingId} onChange={(e) => update('gaTrackingId', e.target.value)} placeholder="G-XXXXXXXXXX" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watermark Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Image Watermark</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="watermark-enabled"
              checked={settings.watermarkEnabled === 'true'}
              onChange={(e) => update('watermarkEnabled', e.target.checked ? 'true' : 'false')}
            />
            <label htmlFor="watermark-enabled" className="text-sm font-medium">Enable watermark on image upload</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Watermark Type</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={settings.watermarkType}
                onChange={(e) => update('watermarkType', e.target.value)}
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div>
              <Label>Position</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={settings.watermarkPosition}
                onChange={(e) => update('watermarkPosition', e.target.value)}
              >
                <option value="northwest">Top Left</option>
                <option value="north">Top Center</option>
                <option value="northeast">Top Right</option>
                <option value="west">Middle Left</option>
                <option value="center">Center</option>
                <option value="east">Middle Right</option>
                <option value="southwest">Bottom Left</option>
                <option value="south">Bottom Center</option>
                <option value="southeast">Bottom Right</option>
              </select>
            </div>
            {settings.watermarkType === 'text' ? (
              <div>
                <Label>Watermark Text</Label>
                <Input value={settings.watermarkText} onChange={(e) => update('watermarkText', e.target.value)} placeholder="TSIANFAN" />
              </div>
            ) : (
              <div>
                <Label>Watermark Image URL</Label>
                <Input value={settings.watermarkImage} onChange={(e) => update('watermarkImage', e.target.value)} placeholder="/images/watermark/logo.png" />
              </div>
            )}
            <div>
              <Label>Opacity (0-100)</Label>
              <Input type="number" value={settings.watermarkOpacity} onChange={(e) => update('watermarkOpacity', e.target.value)} min="0" max="100" />
            </div>
            <div>
              <Label>Size (% of image width)</Label>
              <Input type="number" value={settings.watermarkSize} onChange={(e) => update('watermarkSize', e.target.value)} min="5" max="100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copy Protection & Locale Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Copy Protection & Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="copy-protection-enabled"
              checked={settings.copyProtectionEnabled === 'true'}
              onChange={(e) => update('copyProtectionEnabled', e.target.checked ? 'true' : 'false')}
            />
            <label htmlFor="copy-protection-enabled" className="text-sm font-medium">Enable copy protection (disable right-click and text selection)</label>
          </div>
          <div>
            <Label>Enabled Locales (comma-separated)</Label>
            <Input value={settings.enabledLocales} onChange={(e) => update('enabledLocales', e.target.value)} placeholder="en,fr,de,it,es" />
            <p className="mt-1 text-xs text-gray-400">Controls which languages appear in the language switcher.</p>
          </div>
        </CardContent>
      </Card>

      {/* Save button for all settings */}
      <div className="flex justify-end">
        <Button variant="brand" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              value={passwordChange.currentPassword}
              onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordChange.newPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordChange.confirmPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <Button variant="outline" onClick={handlePasswordChange} disabled={saving}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Version:</span>
            <Badge variant="outline">V2.0</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Database:</span>
            <span>SQLite (dev)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">AI Engine:</span>
            <Badge variant={settings.aiProvider === 'openai' ? 'default' : 'secondary'}>
              {settings.aiProvider === 'openai' ? 'OpenAI' : 'Rule-based (V2.0)'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
