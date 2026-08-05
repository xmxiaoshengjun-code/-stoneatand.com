# 谦帆英文官网 — 技术架构评估报告

> 架构师：Bob（software-architect）
> 日期：2026-08-04
> 项目目录：`C:\Users\Sean xiao\WorkBuddy\2026-08-04-09-49-32\qianfan-website`

---

## 一、现有架构总览

### 技术栈

| 层级 | 技术选型 | 版本 |
|------|---------|------|
| 框架 | Next.js (App Router) | ^14.2.3 |
| 语言 | TypeScript | ^5.4.5 |
| UI | Tailwind CSS + shadcn/ui (Radix) | ^3.4.4 |
| 状态管理 | Zustand + SWR | ^4.5.2 / ^2.2.5 |
| ORM | Prisma | ^5.14.0 |
| 数据库 | SQLite (dev) | — |
| 认证 | JWT (jose) + bcryptjs | ^5.6.3 / ^2.4.3 |
| AI 客服 | 规则引擎 (V1.0)，LLM 预留 (V2.0) | — |
| 邮件 | nodemailer (预留，未配置) | ^6.9.14 |
| 验证 | Zod | ^3.23.8 |

### 架构模式

项目采用 **分层服务架构**：
- `src/app/` — 页面层（App Router 路由 + API Routes）
- `src/components/` — 组件层（UI 组件 + 业务组件）
- `src/lib/services/` — 服务层（业务逻辑，封装 Prisma 调用）
- `src/lib/ai/` — AI 引擎层（规则引擎 + LLM 适配器 + 知识库）
- `src/lib/` — 基础设施层（auth、prisma、geo、email）
- `src/hooks/` — React Hooks 层
- `src/stores/` — Zustand 状态管理
- `src/types/` — TypeScript 类型定义

### 数据模型（Prisma，16 张表）

```
Product ← ProductImage
Product ← Series
Inquiry ← Product / Customer / FollowUp
Customer ← FollowUp
ChatSession ← ChatMessage
Testimonial / Project / Banner / ContentPage
Region / FAQ / User / TrackingEvent
```

---

## 二、分领域评估

### 2.1 Admin 后台架构与可扩展性

#### 现状

- **目录结构**：`src/app/admin/` 包含 dashboard、products、inquiries、customers、projects、content、settings 七个模块
- **API 层**：`src/app/api/admin/` 包含 content（banners/pages/testimonials）、customers、follow-ups、products、projects、stats、upload 路由
- **认证**：JWT httpOnly Cookie + middleware 路由保护，支持 ADMIN/EDITOR/SALES 三种角色
- **导航**：`ADMIN_NAV_ITEMS` 定义了 7 个导航项

#### 强项

1. ✅ **服务层封装良好**：productService、inquiryService、customerService、contentService、chatService、trackingService 均遵循类封装模式，API Routes 仅做参数校验后委托 service 层
2. ✅ **JWT 认证完备**：middleware 层做路由拦截，token 解析后将 userId/email/role 注入请求头
3. ✅ **角色模型预留**：User 模型有 role 字段，支持后续权限分级
4. ✅ **CMS 基础**：Banner、ContentPage、Testimonial 可在后台增删改

#### 短板

1. ❌ **Settings 页面是空壳**：`SettingsPanel.tsx` 的所有按钮都是 `toast.info('...coming soon')`，无实际保存功能
2. ❌ **FAQ 无管理界面**：FAQ 表存在且被 AI 客服使用，但后台 ContentManager 只有 Banners/Pages/Testimonials 三个 Tab，缺少 FAQ 管理
3. ❌ **Region 无管理界面**：Region 表存在但后台无法 CRUD
4. ❌ **Chat 会话无管理界面**：ChatSession/ChatMessage 存在，`chatService.getRecentSessions()` 方法已实现，但后台无聊天记录查看页面
5. ❌ **SEO 元数据无管理界面**：ContentPage 有 metaTitle/metaDescription 字段，但 ContentEditor 缺少已有内容列表和编辑功能（只能新增）
6. ❌ **Dashboard 数据单一**：`DashboardClient.tsx` 只显示询盘统计（total/new/contacted/won），未展示访客追踪数据（trackingStats 已从 API 返回但未渲染）
7. ❌ **无批量操作**：产品/询盘无批量删除、批量状态变更功能
8. ❌ **无操作日志**：缺少 admin 操作审计日志

#### 推荐新增

| 模块 | 说明 | 涉及文件 |
|------|------|---------|
| FAQ 管理器 | 在 ContentManager 增加 FAQ Tab | `ContentManager.tsx`、新增 `src/app/api/admin/content/faqs/route.ts` |
| Region 管理器 | 在 ContentManager 增加 Region Tab | `ContentManager.tsx`、新增 `src/app/api/admin/content/regions/route.ts` |
| Chat 管理页 | 新增 `/admin/chat` 页面查看聊天记录 | 新增 `src/app/admin/chat/`、修改 `nav.ts` |
| SEO 管理页 | 新增 `/admin/seo` 页面管理各页面 meta | 新增 `src/app/admin/seo/`、新增 `src/app/api/admin/seo/route.ts` |
| Analytics 仪表盘 | 增强 Dashboard 展示访客数据 | 修改 `DashboardClient.tsx`、新增 `src/components/admin/AnalyticsChart.tsx` |
| Settings 完善 | 实现账户信息修改、密码修改、AI/Email 配置 | 修改 `SettingsPanel.tsx`、新增 `src/app/api/admin/settings/route.ts` |

---

### 2.2 SEO / GEO 实现

#### 现状

- **sitemap.ts**：从数据库动态生成，包含静态页 + 产品页 + 系列页 + 项目页
- **robots.ts**：配置正确，disallow `/admin/` 和 `/api/`
- **JSON-LD 结构化数据**：
  - 首页：Organization schema
  - 产品页：Product schema（含 additionalProperty）
  - 面包屑：BreadcrumbList schema（组件存在但仅产品页使用）
- **metadata**：根 layout 有默认 metadata，产品页有 `generateMetadata`
- **GEO 检测**：middleware 通过 `CF-IPCountry`/`X-Vercel-IP-Country` 检测国家，映射为 4 个区域（north-america/europe/asia/global），写入 Cookie
- **Region 表**：存储区域配置（code/name/phone/email/timezone）

#### 强项

1. ✅ sitemap 动态生成，产品上下架自动反映
2. ✅ Product JSON-LD 包含 SKU、品牌、制造商、规格属性
3. ✅ GEO 检测在 middleware 层（Edge Runtime），性能好
4. ✅ Cookie 持久化区域信息（30 天）
5. ✅ 每个页面有 Breadcrumb 组件

#### 短板

1. ❌ **无 hreflang / alternates 标签**：对于多区域国际站，缺少 `hreflang` 声明，搜索引擎无法区分不同区域版本
2. ❌ **无 canonical URL**：各页面未设置 canonical，可能导致重复内容问题（如 `?series=xxx` 参数页）
3. ❌ **OG 图片单一**：只有全局 `DEFAULT_META.ogImage`，产品页无专属 OG 图
4. ❌ **FAQ 页无 FAQPage schema**：`/faq` 页面缺少 FAQPage 结构化数据（可获取 rich snippet）
5. ❌ **项目页无结构化数据**：`/projects/[slug]` 缺少 ImageGallery/CreativeWork schema
6. ❌ **BreadcrumbJsonLd 组件未全页使用**：只在产品页引入，about/contact/faq 等页面未使用
7. ❌ **about/contact 页 metadata 静态**：不读取 ContentPage 的 metaTitle/metaDescription
8. ❌ **无 RSS / News Feed**：缺少内容订阅渠道
9. ❌ **无 Google Search Console 验证**：缺少 verification meta tag
10. ❌ **GEO 检测后无内容差异化**：Cookie 写入后，页面未根据区域展示不同联系方式/价格/推荐产品
11. ❌ **无动态 OG 图生成**：无法用 `@vercel/og` 为每个产品生成社交分享图
12. ❌ **无 blog/article 系统**：缺少内容营销基础设施

#### 推荐新增

| 功能 | 说明 | 优先级 |
|------|------|--------|
| hreflang + canonical | 在各页面 metadata 增加 alternates 和 canonical | P0 |
| FAQPage schema | 为 /faq 页增加 FAQPage JSON-LD | P1 |
| 全页 BreadcrumbJsonLd | about/contact/projects/faq 等页面统一使用 | P1 |
| 动态 OG 图 | 使用 `@vercel/og` 或 `next/og` 为产品页生成专属社交图 | P2 |
| GEO 内容差异化 | 根据 region cookie 展示区域专属联系方式/推荐 | P1 |
| SEO 元数据管理 | 后台可编辑各页面 meta title/description | P1 |
| Blog 系统 | 新增 BlogPost 模型 + /blog 路由 + admin 管理 | P2 |
| 程序化 SEO | 基于长尾关键词自动生成 landing page | P3 |

---

### 2.3 AI 客服实现

#### 现状

- **架构**：`ChatEngine` → `RuleEngine`（关键词匹配）→ `LLMProvider`（预留）→ fallback
- **知识库**：`KnowledgeBase` 提供 `searchProducts`（关键词搜索）、`findProductsByTileSize`（规格匹配）、`searchFAQs`（FAQ 搜索）
- **规则**：12 条规则（问候、SKU 数量、系列信息、价格、运输、公司信息、联系方式、厚度、定制、规格匹配、FAQ fallback）
- **会话**：ChatSession + ChatMessage 持久化，sessionId 用 nanoid 生成
- **前端**：ChatWidget 浮窗组件，useChat hook 管理状态

#### 强项

1. ✅ **适配器模式**：LLMProvider 抽象接口，可无缝切换 LLM 供应商
2. ✅ **规则 + LLM fallback 链**：先规则匹配，未命中再走 LLM
3. ✅ **会话持久化**：所有对话存入数据库，可用于后续分析
4. ✅ **产品推荐**：聊天中可返回 suggestedProducts，前端展示卡片
5. ✅ **规格匹配**：可从自然语言中提取尺寸（如 "600x600"）并匹配产品

#### 短板

1. ❌ **LLM 未实现**：`llmProvider.generateResponse()` 是空壳，只 return null
2. ❌ **无流式响应**：前端等完整响应才显示，体验差
3. ❌ **无多语言**：仅支持英文，无中文/西语等
4. ❌ **无 lead capture**：聊天中无法收集客户邮箱/手机号自动创建询盘
5. ❌ **无人工转接**：无法从 AI 切换到人工客服
6. ❌ **无快捷回复按钮**：用户只能打字，无建议问题点击
7. ❌ **知识库搜索粗糙**：`contains` 关键词匹配，无模糊/语义搜索
8. ❌ **无聊天分析**：后台无聊天数据看板（会话数、满意度、未解决率）
9. ❌ **无 FAQ 管理界面**：FAQ 表存在但后台无法编辑
10. ❌ **无文件/图片分享**：用户无法发送产品图片让 AI 识别
11. ❌ **会话历史不恢复**：刷新页面后 useChat 重新初始化，不加载之前的 ChatSession

#### 推荐新增

| 功能 | 说明 | 优先级 |
|------|------|--------|
| LLM 接入 | 实现 `llmProvider.generateResponse()`，接入 OpenAI/Claude API | P0 |
| 流式响应 | 使用 Vercel AI SDK 的 `streamText` + 前端 `useChat` | P0 |
| Lead capture | 聊天中收集邮箱并自动创建 Inquiry | P1 |
| 快捷回复 | AI 返回 suggestedQuestions，前端渲染按钮 | P1 |
| 人工转接 | 检测复杂问题或用户要求，标记 ChatSession 为 TRANSFERRED | P2 |
| 聊天管理页 | 后台查看聊天记录、会话统计 | P1 |
| FAQ 管理 | 后台 ContentManager 增加 FAQ Tab | P1 |
| 会话恢复 | 前端刷新后从 API 加载已有会话历史 | P2 |
| 多语言 | 根据区域 cookie 切换聊天语言 | P3 |

---

### 2.4 数据分析 / 访客统计

#### 现状

- **TrackingEvent 模型**：sessionId、customerId、eventType、pageUrl、productId、searchData、duration、country
- **API**：`POST /api/tracking` 接收前端事件
- **Hook**：`useTracking()` 提供 trackPageView、trackProductView、trackInquirySubmit、trackChatStart、trackSearch、trackSpecFinder
- **统计**：`trackingService.getStats()` 返回 totalEvents、uniqueVisitors、productViews、inquirySubmits、chatStarted

#### 强项

1. ✅ **埋点基础设施完备**：模型、API、Hook 三层就绪
2. ✅ **事件类型丰富**：覆盖页面浏览、产品查看、询盘提交、聊天开始、搜索、规格查找
3. ✅ **统计 API 已实现**：可按天数查询汇总数据

#### 短板

1. ❌ **useTracking 未被任何页面调用**：Hook 定义了但未在 page.tsx 中 import 使用，实际无事件被记录！
2. ❌ **无 GA4 集成**：`NEXT_PUBLIC_GA_ID` 为空，无 Google Analytics
3. ❌ **Dashboard 未展示追踪数据**：`/api/admin/stats` 返回 tracking 数据但 `DashboardClient.tsx` 只渲染询盘统计
4. ❌ **无转化漏斗**：无法追踪 "浏览→搜索→查看产品→询盘" 转化路径
5. ❌ **无 UTM 参数追踪**：无法区分流量来源（Google/直接/社交媒体）
6. ❌ **无设备/浏览器分析**：TrackingEvent 无 userAgent 解析
7. ❌ **无时间序列图表**：仅有汇总数字，无趋势图
8. ❌ **无数据导出**：无法导出 CSV/Excel
9. ❌ **SQLite 性能瓶颈**：高流量下 TrackingEvent 表会膨胀，SQLite 写入性能有限

#### 推荐新增

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 全站埋点接入 | 在 layout.tsx 或各页面调用 useTracking | P0 |
| GA4 集成 | 配置 `NEXT_PUBLIC_GA_ID`，集成 gtag | P0 |
| Analytics 仪表盘 | Dashboard 增加访客统计卡片 + 趋势图 | P1 |
| 转化漏斗 | 新增 funnel 事件类型 + 后台漏斗分析 | P1 |
| UTM 追踪 | 解析 URL 参数并存入 TrackingEvent | P1 |
| 数据导出 | API 返回 CSV，前端下载 | P2 |
| 图表组件 | 使用 `recharts` 或 `@nivo/charts` | P1 |
| 数据库迁移建议 | 生产环境迁移到 PostgreSQL | P2 |

---

### 2.5 社交媒体分享 / 外链共享

#### 现状

- **WhatsApp 浮动按钮**：固定在右下角，带 ping 动画
- **OG metadata**：根 layout 有 openGraph 配置
- **CookieConsent**：有 GDPR Cookie 同意组件

#### 短板

1. ❌ **无社交分享按钮**：产品页、项目页无 Facebook/Twitter/LinkedIn/Pinterest 分享按钮
2. ❌ **无社交媒体链接**：Footer 无社交账号入口
3. ❌ **无 Pinterest Save 按钮**：建材行业 Pinterest 是重要引流渠道
4. ❌ **无 "Copy Link" 功能**：用户无法快速复制产品链接
5. ❌ **无邮件分享**：无法将产品通过邮件分享给同事
6. ❌ **无 QR 码生成**：无法生成产品页 QR 码用于线下物料
7. ❌ **无产品 PDF 下载**：无法生成产品规格 PDF 用于离线分享
8. ❌ **无 UTM 追踪的分享链接**：分享时不自动附加 utm_source

#### 推荐新增

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 社交分享组件 | `ShareButtons.tsx`，支持 FB/Twitter/LinkedIn/Pinterest/Email/CopyLink | P1 |
| Footer 社交链接 | 增加 social 字段到 SITE_CONFIG | P1 |
| 产品 PDF 下载 | 使用 `@react-pdf/renderer` 生成产品规格单 | P2 |
| QR 码生成 | 使用 `qrcode` 包生成产品页 QR | P2 |
| 分享带 UTM | 分享链接自动附加 utm_source=social | P2 |

---

### 2.6 自主 SEO/GEO 迭代技术路径

#### 现状

无自主 SEO 迭代能力，所有元数据硬编码在代码或常量文件中。

#### 短板

1. ❌ **SEO 元数据不可后台编辑**：`seo.ts` 常量文件硬编码，无法在后台修改
2. ❌ **无关键词排名监控**：无法追踪目标关键词在 Google 的排名变化
3. ❌ **无 Landing Page 生成器**：无法为长尾关键词批量创建 SEO 优化页面
4. ❌ **无内链管理**：无法系统化管理内部链接结构
5. ❌ **无结构化数据验证**：无工具验证 JSON-LD 是否正确
6. ❌ **无站点健康检查**：无死链检测、页面速度监控
7. ❌ **无 Search Console 集成**：无法拉取索引状态、点击数据

#### 推荐技术路径

```
Phase 1: 基础 SEO 管理
  → 新增 SeoMetadata 模型（page slug → metaTitle/metaDescription/keywords/ogImage）
  → 后台 SEO 管理页面
  → 页面 generateMetadata 从 DB 读取

Phase 2: 内容营销引擎
  → 新增 BlogPost 模型（title/slug/content/metaInfo/category/tags）
  → /blog 路由 + 文章列表/详情页
  → 后台 Blog 管理器（富文本编辑）
  → 文章 JSON-LD (Article schema)

Phase 3: 程序化 SEO
  → 基于产品规格自动生成长尾页面（如 "tile display rack for 600x600 tiles"）
  → 动态 sitemap 扩展
  → 自动内链

Phase 4: SEO 监控
  → Google Search Console API 集成
  → 关键词排名追踪
  → 站点健康检查（死链、速度、结构化数据验证）
```

---

## 三、推荐新增/修改的核心文件清单

### 3.1 新增文件

```
src/
├── app/
│   ├── admin/
│   │   ├── chat/                        # 聊天管理页
│   │   │   ├── page.tsx
│   │   │   └── ChatList.tsx
│   │   ├── seo/                         # SEO 管理页
│   │   │   ├── page.tsx
│   │   │   └── SeoPanel.tsx
│   │   ├── analytics/                   # 数据分析页
│   │   │   ├── page.tsx
│   │   │   └── AnalyticsDashboard.tsx
│   │   └── blog/                        # Blog 管理页 (Phase 2)
│   │       ├── page.tsx
│   │       └── BlogManager.tsx
│   ├── blog/                            # Blog 前台 (Phase 2)
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── api/
│       ├── admin/
│       │   ├── content/faqs/route.ts    # FAQ CRUD API
│       │   ├── content/regions/route.ts # Region CRUD API
│       │   ├── chat/sessions/route.ts   # Chat 会话查询 API
│       │   ├── seo/route.ts            # SEO 元数据 CRUD API
│       │   ├── analytics/route.ts       # 分析数据 API
│       │   └── settings/route.ts       # 设置保存 API
│       └── og/[...slug]/route.ts       # 动态 OG 图生成
├── components/
│   ├── admin/
│   │   ├── AnalyticsChart.tsx           # 图表组件
│   │   ├── FaqEditor.tsx               # FAQ 编辑器
│   │   ├── RegionEditor.tsx             # Region 编辑器
│   │   └── ChatSessionViewer.tsx        # 聊天记录查看
│   ├── common/
│   │   ├── ShareButtons.tsx             # 社交分享按钮
│   │   ├── SocialLinks.tsx              # 社交媒体链接
│   │   └── AnalyticsTracker.tsx         # 全局埋点组件
│   └── seo/
│       ├── FaqJsonLd.tsx                # FAQ 结构化数据
│       └── ArticleJsonLd.tsx            # Blog 文章结构化数据
├── lib/
│   ├── services/
│   │   ├── seoService.ts                # SEO 元数据管理
│   │   ├── analyticsService.ts          # 分析数据聚合
│   │   └── blogService.ts               # Blog 服务 (Phase 2)
│   └── ai/
│       └── llmProvider.ts               # 修改：实现 LLM 调用
├── types/
│   ├── seo.ts                           # SEO 类型定义
│   └── analytics.ts                     # 分析数据类型
└── prisma/
    └── schema.prisma                     # 修改：新增模型
```

### 3.2 需修改的现有文件

| 文件 | 修改内容 |
|------|---------|
| `prisma/schema.prisma` | 新增 SeoMetadata、BlogPost、SocialLink 模型 |
| `src/lib/constants/nav.ts` | ADMIN_NAV_ITEMS 增加 Chat/SEO/Analytics/Blog 导航 |
| `src/lib/constants/seo.ts` | 增加 SOCIAL_LINKS 配置 |
| `src/app/layout.tsx` | 增加 GA4 script、AnalyticsTracker 组件 |
| `src/app/admin/layout.tsx` | 无需修改（子页面自动继承） |
| `src/components/admin/ContentManager.tsx` | 增加 FAQ/Region Tab |
| `src/app/admin/dashboard/DashboardClient.tsx` | 增加 tracking 数据渲染 |
| `src/app/admin/settings/SettingsPanel.tsx` | 实现实际保存功能 |
| `src/components/layout/Footer.tsx` | 增加社交媒体链接区域 |
| `src/app/products/[sku]/page.tsx` | 增加 ShareButtons、canonical、动态 OG |
| `src/app/about/page.tsx` | 改为 generateMetadata 从 DB 读取 |
| `src/app/contact/page.tsx` | 改为 generateMetadata 从 DB 读取 |
| `src/app/faq/page.tsx` | 增加 FaqJsonLd |
| `src/hooks/useTracking.ts` | 增加 UTM 解析 |
| `src/lib/ai/llmProvider.ts` | 实现 OpenAI/Claude API 调用 |
| `src/components/chat/ChatWidget.tsx` | 增加快捷回复、流式响应 |
| `src/hooks/useChat.ts` | 增加会话恢复、流式处理 |
| `src/app/sitemap.ts` | 增加 blog 页面 |
| `middleware.ts` | 无需修改（GEO 检测已就绪） |

---

## 四、推荐新增的 Prisma 模型

```prisma
/// SEO 元数据，按页面 slug 管理
model SeoMetadata {
  id              Int      @id @default(autoincrement())
  pageSlug        String   @unique   // "home", "about", "products", "product:ct-001" 等
  metaTitle       String?
  metaDescription String?
  keywords        String?
  ogImage         String?
  canonicalUrl    String?
  noindex         Boolean  @default(false)
  updatedAt       DateTime @updatedAt

  @@index([pageSlug])
}

/// Blog 文章 (Phase 2)
model BlogPost {
  id              Int      @id @default(autoincrement())
  title           String
  slug            String   @unique
  excerpt         String?
  content         String
  coverImage       String?
  category        String?
  tags            String?  // JSON array
  metaTitle       String?
  metaDescription String?
  isPublished     Boolean  @default(false)
  publishedAt     DateTime?
  authorId        Int?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([slug])
  @@index([isPublished])
  @@index([category])
}

/// 社交媒体链接配置
model SocialLink {
  id        Int      @id @default(autoincrement())
  platform  String   @unique  // "facebook", "twitter", "linkedin", "pinterest", "youtube", "instagram"
  url       String
  icon      String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
}

/// 站点设置 (key-value 存储)
model SiteSetting {
  id    Int    @id @default(autoincrement())
  key   String @unique
  value String?
  type  String @default("string") // "string" | "json" | "boolean"
}
```

---

## 五、依赖包建议

### 新增依赖

```
# AI / LLM
openai@^4.52.0              # OpenAI API SDK（或 @anthropic-ai/sdk）
ai@^3.2.0                   # Vercel AI SDK（流式响应）

# 图表
recharts@^2.12.0             # Admin 分析仪表盘图表

# 分享/社交
react-share@^5.0.0          # 社交分享按钮组件

# QR 码
qrcode@^1.5.3               # QR 码生成
@types/qrcode@^1.5.5

# PDF 生成 (Phase 2)
@react-pdf/renderer@^3.4.0  # 产品规格 PDF 下载

# 富文本编辑 (Phase 2 - Blog)
@tiptap/react@^2.4.0        # TipTap 富文本编辑器
@tiptap/starter-kit@^2.4.0

# OG 图生成
@vercel/og@^0.6.0           # 动态 OG 图（如部署在 Vercel）
```

### 已有依赖无需变更

- next、react、prisma、zustand、swr、zod、jose、bcryptjs、nodemailer 均满足需求

---

## 六、实现顺序建议

### Phase 1 — 基础营销能力（P0，1-2 周）

| 序号 | 任务 | 依赖 | 说明 |
|------|------|------|------|
| 1.1 | 全站埋点接入 | 无 | 在 layout.tsx 嵌入 AnalyticsTracker，各页面调用 useTracking |
| 1.2 | GA4 集成 | 1.1 | 配置 GA_ID，在 layout 注入 gtag script |
| 1.3 | LLM 客服实现 | 无 | 实现 llmProvider.generateResponse()，接入 OpenAI API |
| 1.4 | 流式聊天响应 | 1.3 | 使用 Vercel AI SDK streamText 重构 /api/chat |
| 1.5 | hreflang + canonical | 无 | 各页面 metadata 增加 alternates/canonical |
| 1.6 | FAQPage schema | 无 | /faq 页增加 FAQPage JSON-LD |
| 1.7 | 社交分享按钮 | 无 | 新增 ShareButtons 组件，嵌入产品页 |

### Phase 2 — 后台增强（P1，2-3 周）

| 序号 | 任务 | 依赖 | 说明 |
|------|------|------|------|
| 2.1 | Prisma schema 扩展 | 无 | 新增 SeoMetadata、SocialLink、SiteSetting 模型 |
| 2.2 | FAQ/Region 管理界面 | 2.1 | ContentManager 增加 Tab + API |
| 2.3 | SEO 管理页面 | 2.1 | 新增 /admin/seo + API + SeoService |
| 2.4 | Analytics 仪表盘 | 1.1 | 增强 Dashboard + recharts 图表 |
| 2.5 | 聊天管理页 | 无 | 新增 /admin/chat + ChatSessionViewer |
| 2.6 | Settings 完善 | 2.1 | 实现 SiteSetting CRUD + 密码修改 |
| 2.7 | Footer 社交链接 | 2.1 | SocialLink 模型 + Footer 渲染 |
| 2.8 | GEO 内容差异化 | 无 | 根据 region cookie 展示区域信息 |

### Phase 3 — 高级营销（P2，3-4 周）

| 序号 | 任务 | 依赖 | 说明 |
|------|------|------|------|
| 3.1 | Blog 系统 | 2.1 | BlogPost 模型 + /blog 路由 + 后台管理 |
| 3.2 | 动态 OG 图生成 | 无 | @vercel/og 生成产品社交图 |
| 3.3 | 产品 PDF 下载 | 无 | @react-pdf/renderer 生成规格单 |
| 3.4 | Lead capture in chat | 1.4 | 聊天中收集邮箱 → 自动创建 Inquiry |
| 3.5 | 转化漏斗追踪 | 1.1 | 新增 funnel 事件类型 + 后台分析 |
| 3.6 | UTM 参数追踪 | 1.1 | 解析 URL 参数存入 TrackingEvent |
| 3.7 | 人工转接 | 1.4 | ChatSession 标记 TRANSFERRED + 通知 |

### Phase 4 — 自主 SEO 迭代（P3，4-6 周）

| 序号 | 任务 | 依赖 | 说明 |
|------|------|------|------|
| 4.1 | 程序化 SEO 页面 | 3.1 | 基于产品规格生成长尾 landing page |
| 4.2 | Search Console 集成 | 无 | 拉取索引状态、点击数据 |
| 4.3 | 关键词排名监控 | 4.2 | 追踪目标关键词排名变化 |
| 4.4 | 站点健康检查 | 无 | 死链检测、页面速度、结构化数据验证 |
| 4.5 | 内链管理 | 3.1 | 系统化管理内部链接结构 |

---

## 七、关键架构决策建议

### 7.1 数据库迁移

**当前**：SQLite (dev)
**建议**：生产环境迁移到 PostgreSQL

理由：
- TrackingEvent 表高写入频率，SQLite 单线程写入会成瓶颈
- PostgreSQL 支持全文搜索（`tsvector`），可替代当前 `contains` 关键词搜索
- Prisma 已预留 `provider = "sqlite"` 注释说明生产切 PostgreSQL

### 7.2 AI 客服架构升级

```
当前架构：
  ChatWidget → /api/chat → chatService.sendMessage() → ChatEngine → RuleEngine → fallback

建议架构：
  ChatWidget → /api/chat (streaming) → chatService.streamMessage()
    → ChatEngine.processStream()
      → RuleEngine.match() (快速规则)
      → if no match: LLMProvider.streamResponse() (流式 LLM)
        → System Prompt (公司信息 + 产品目录摘要)
        → RAG: KnowledgeBase.searchProducts() 注入上下文
        → Function Calling: 可调用 searchProducts/findProductsByTileSize/createInquiry
      → fallback response
```

### 7.3 埋点架构

```
建议方案：双轨制
  1. 自建埋点（TrackingEvent 表）→ 后台分析仪表盘
  2. GA4（gtag）→ Google Analytics 看板

全局埋点组件 AnalyticsTracker:
  - 在 layout.tsx 包裹
  - 自动追踪 page_view（usePathname 监听路由变化）
  - 自动解析 UTM 参数
  - 发送 sessionId（与 chat sessionId 共享）
```

### 7.4 SEO 元数据管理

```
建议方案：SeoMetadata 表 + generateMetadata 动态读取

页面优先级链：
  1. DB SeoMetadata (pageSlug 匹配) → 最高优先级
  2. 页面静态 metadata → 次优先级
  3. 根 layout 默认 metadata → 最低优先级

封装为 helper:
  src/lib/services/seoService.ts
    → getMetadata(pageSlug: string): Promise<Metadata>
    → 各页面 generateMetadata 内调用
```

---

## 八、风险与注意事项

1. **SQLite 并发限制**：当前 dev 用 SQLite，埋点高频写入可能导致 `SQLITE_BUSY` 错误。建议开发阶段就引入写入队列或批量插入
2. **LLM API 成本**：接入 OpenAI/Claude 需考虑 API 调用成本，建议设置 rate limit 和缓存
3. **GA4 合规**：需确保 CookieConsent 组件在用户同意后才加载 GA4 脚本（当前 CookieConsent 存在但未与 GA4 联动）
4. **OG 图生成**：`@vercel/og` 仅在 Vercel 部署时可用；如用其他平台需用 `satori` + 自定义方案
5. **Prisma 迁移**：新增模型后需运行 `prisma db push`，注意 SQLite 不支持部分 PostgreSQL 特性（如 enum）
6. **多语言扩展**：当前全站英文，若未来需多语言，建议尽早引入 `next-intl` 或 `next-i18next`

---

## 九、总结

谦帆官网现有架构**基础扎实**，分层清晰，服务层封装规范。但在营销能力方面存在以下核心缺口：

| 领域 | 成熟度 | 核心缺口 |
|------|--------|---------|
| Admin 后台 | ★★★☆☆ | Settings 空壳、缺 FAQ/Chat/SEO/Analytics 管理页 |
| SEO/GEO | ★★★☆☆ | 缺 hreflang/canonical/动态 OG/SEO 管理后台 |
| AI 客服 | ★★☆☆☆ | LLM 未实现、无流式、无 lead capture |
| 数据分析 | ★★☆☆☆ | 埋点未接入、无 GA4、Dashboard 不展示追踪数据 |
| 社交分享 | ★☆☆☆☆ | 无分享按钮、无社交链接、无 PDF/QR |
| SEO 迭代 | ★☆☆☆☆ | 无后台 SEO 管理、无 Blog、无程序化 SEO |

**建议优先实施 Phase 1**（全站埋点 + GA4 + LLM 客服 + hreflang + 社交分享），这 7 项任务可显著提升营销基础设施，且相互独立可并行开发。
