# TSIANFAN 英文官网 SEO 全面审查报告

> 审查日期: 2026-08-06
> 审查团队: 架构师高见远（技术SEO） + 产品经理许清楚（内容SEO）
> 项目路径: C:\Users\Sean xiao\WorkBuddy\2026-08-04-09-49-32\qianfan-website

---

## TL;DR

发现 **10个 P0 严重问题**、**17个 P1 重要问题**、**16个 P2 优化建议**。最关键的问题包括：sitemap 所有 URL 触发 301 重定向、hreflang 使用相对路径、OG 图片不存在、结构化数据不完整、全站数据过时（55/7 → 172/17）、产品描述高度重复、导航缺少 10 个系列入口。

---

## P0 — 严重问题（上线前必须修复）

| # | 问题 | 类别 | 影响 | 修复方案 | 涉及文件 |
|---|------|------|------|----------|----------|
| P0-1 | **Sitemap 所有 URL 触发 301 重定向** | 技术 | sitemap 列出 `/products/ct-001` 但 middleware 重定向到 `/en/products/ct-001`，860+ URL 浪费抓取预算 | 为每个 URL 生成 5 个 locale 版本 + hreflang alternates | `src/app/sitemap.ts` |
| P0-2 | **Hreflang alternates 使用相对路径** | 技术 | Google 要求绝对 URL，当前 `/en` `/fr` 等，多语言页面可能互相竞争排名 | 全部改为 `https://www.tsianfan.com/en` 等绝对 URL | `src/app/[locale]/layout.tsx`, `(marketing)/layout.tsx`, 产品/项目详情页 |
| P0-3 | **OG 图片不存在** | 技术+内容 | `public/images/og-image.jpg` 文件不存在，社交分享无预览图，CTR 大幅下降 | 创建 1200x630px OG 图片，在 openGraph/twitter 中引用 | `public/images/og-image.jpg`(新建), `src/app/layout.tsx` |
| P0-4 | **Product JSON-LD 缺少必需字段** | 技术 | 缺少 image、offers、aggregateRating，无法触发 Product Rich Result | 添加 image(产品图)、offers(B2B "Contact for pricing")、aggregateRating(从 Testimonial 读取) | `src/components/seo/ProductJsonLd.tsx` |
| P0-5 | **Organization JSON-LD 缺少 logo/sameAs** | 技术 | 无法触发 Knowledge Graph 面板 | 添加 logo URL + sameAs 社交媒体链接数组 | `src/lib/constants/seo.ts` |
| P0-6 | **全站数据过时："55 SKUs / 7 series"** | 技术+内容 | 实际 172 产品 17 系列，10+ 处硬编码仍为 55/7，影响品牌可信度 | 全局替换：55→172, 7→17，覆盖 seo.ts、layout.tsx、5 个翻译文件 | `src/lib/constants/seo.ts`, `src/app/layout.tsx`, `src/messages/*.json` |
| P0-7 | **产品描述高度重复（59 个产品受影响）** | 内容 | CT 14个/CC 13个/CH 6个等共用同一 features 字符串，Google 可能降权 | 为每个 SKU 撰写差异化 features 和 description | DB Product 表 |
| P0-8 | **产品图片 alt 无 SEO 价值** | 内容 | 全部 172 张图 alt 为 "{SKU} product image"，错失图片搜索流量 | 改为 "{产品名} - {系列名} - {关键规格}" | DB ProductImage 表 |
| P0-9 | **产品 meta description 无优化** | 内容 | 172 个页面 description = product.description（平均仅 100 字符），无 CTA/关键词 | 创建 meta description 模板，含关键词+CTA | `src/app/[locale]/(marketing)/products/[sku]/page.tsx` |
| P0-10 | **产品页 generateMetadata 未多语言化** | 内容 | 5 语言产品页共享同一英文 title/description | 修改 generateMetadata 接收 locale，加载本地化模板 | `src/app/[locale]/(marketing)/products/[sku]/page.tsx` |

---

## P1 — 重要问题（1-2 周内修复）

| # | 问题 | 类别 | 修复方案 | 涉及文件 |
|---|------|------|----------|----------|
| P1-1 | BreadcrumbJsonLd 组件从未使用 | 技术 | 在所有有面包屑的页面渲染该组件 | 各营销页面 |
| P1-2 | 首页缺少 generateMetadata | 技术 | 添加 per-locale 的 title/description | `(marketing)/page.tsx` |
| P1-3 | 缺少 WebSite schema | 技术 | 添加 Sitelinks Search Box JSON-LD | `(marketing)/page.tsx` |
| P1-4 | FAQ 页面缺少 FAQPage JSON-LD | 技术+内容 | 添加 FAQPage schema | `faq/page.tsx` |
| P1-5 | 缺少 HSTS 和 CSP 安全头 | 技术 | 添加 Strict-Transport-Security + 基础 CSP | `next.config.mjs` |
| P1-6 | 静态页面缺少 Cache-Control | 技术 | 添加 _next/static 长缓存 + HTML 短缓存 | `next.config.mjs` |
| P1-7 | Admin/API 页面缺少 noindex | 技术 | admin layout 添加 robots noindex | `admin/layout.tsx` |
| P1-8 | 多个页面缺少显式 canonical URL | 技术 | 各页面添加 alternates.canonical | 7 个营销页面 |
| P1-9 | inquiry/success 页面缺少 noindex | 技术 | 添加 robots noindex | `inquiry/success/page.tsx` |
| P1-10 | 导航/页脚仅展示 7 个系列，缺少 10 个新系列 | 内容 | 更新 NAV_ITEMS + FOOTER_LINKS 为全 17 系列 | `src/lib/constants/nav.ts` |
| P1-11 | 关键词策略过于狭窄（仅 tile 相关） | 内容 | 扩展至 20+ 关键词覆盖全 17 系列 | `layout.tsx`, 各页面 meta |
| P1-12 | FAQ/Contact 页面使用旧品牌名 "Qianfan" | 内容 | 改为 TSIANFAN | `faq/page.tsx`, `contact/page.tsx` |
| P1-13 | 翻译文件中数据同样过时 | 内容 | 更新 5 语言文件的 55/7 数字 | `src/messages/*.json` |
| P1-14 | 产品名称缺乏关键词 | 内容 | 添加品类关键词到产品名 | DB Product 表 |
| P1-15 | 翻译质量问题（DE/IT/FR 有错误） | 内容 | 人工审校修正 | `src/messages/{fr,de,it,es}.json` |
| P1-16 | Seed 数据矛盾（16 years/6 countries/Foshan） | 内容 | 修正为 18+ years/80+ countries/Xiamen | DB FAQ/ContentPage 表 |
| P1-17 | 缺少独立系列分类页面 | 内容 | 创建 `/products/series/[slug]` 页面 | 新建路由 |

---

## P2 — 优化建议（长期改进）

| # | 建议 | 类别 |
|---|------|------|
| P2-1 | Sitemap 添加 FAQ 页面 | 技术 |
| P2-2 | 升级为 LocalBusiness schema | 技术 |
| P2-3 | 分割 sitemap 为多个子 sitemap | 技术 |
| P2-4 | 利用 Testimonial 数据添加 aggregateRating | 技术 |
| P2-5 | 添加 Review JSON-LD | 技术 |
| P2-6 | 创建博客/资源中心 | 内容 |
| P2-7 | 添加 "Buying Guide" 内容页面 | 内容 |
| P2-8 | 产品页面添加 300-500 字富文本描述 | 内容 |
| P2-9 | 添加产品视频 + VideoObject schema | 内容 |
| P2-10 | 创建系列对比页面 | 内容 |
| P2-11 | 多语言关键词本地化（非直译） | 内容 |
| P2-12 | 添加 Trust Badges 到首页/产品页 | 内容 |

---

## 关键词策略

### 核心关键词（按 Tier 分层）

**Tier 1 — 高搜索量/高商业意图**
- tile display rack, tile showroom display, stone display rack, tile display stand, ceramic tile display, slab display rack, flooring display rack, tile sample display

**Tier 2 — 品类覆盖（对应 17 系列）**
- wood flooring display rack, mosaic display stand, carpet display rack, bathroom tile display, door display stand, tile sample cabinet, tile sample box, painting sample display, MDF board display, tile wall panel display

**Tier 3 — 长尾/规格型**
- large format tile display rack, sliding tile display rack, 1200x2400 tile display rack, ultra-thin panel display rack, double-sided tile display, modular tile display wall

**Tier 4 — 信息型（博客内容）**
- how to choose tile display rack, tile showroom design ideas, tile display rack manufacturer China, OEM tile display stand, custom tile display solution

### 多语言关键词映射

| EN | FR | DE | IT | ES |
|----|----|----|----|-----|
| tile display rack | présentoir à carrelage | Fliesenpräsentationsständer | espositore per piastrelle | expositor de baldosas |
| stone display rack | présentoir pierre | Steinpräsentationsständer | espositore per pietra | expositor de piedra |
| flooring display rack | présentoir parquet | Bodenpräsentation | espositore pavimenti | expositor de tarima |
| slab display rack | présentoir dalle | Plattenpräsentation | espositore lastre | expositor de losas |
| mosaic display stand | présentoir mosaïque | Mosaikpräsentation | espositore mosaico | expositor de mosaico |

---

## 现有优势（已正确实现）

1. Next.js Metadata API 全面使用
2. hreflang 多语言声明已覆盖 5 语言 + x-default
3. Product/Organization JSON-LD 已渲染（虽不完整）
4. canonical URL 策略（产品/项目详情页）
5. generateStaticParams 预渲染
6. robots.txt 配置合理
7. 图片优化（AVIF/WebP、next/image）
8. 响应式设计
9. 内部链接结构（Header 导航 + Footer 三栏）
10. metadataBase 已设置
11. 社交分享组件（6 平台）
12. 安全头部分配置

---

## 修复路线图

### Phase 1（立即 — 上线前）
- P0-1: 修复 sitemap 添加 locale 路径
- P0-2: hreflang 改为绝对 URL
- P0-3: 创建 OG 图片
- P0-4: 完善 Product JSON-LD
- P0-5: 完善 Organization JSON-LD
- P0-6: 全局替换 55/7 → 172/17
- P0-7~10: 产品描述/alt/meta 优化

### Phase 2（1-2 周）
- P1-1~9: 技术修复（Breadcrumb JSON-LD、首页 meta、WebSite schema、FAQ schema、安全头、缓存、noindex、canonical）
- P1-10~17: 内容修复（导航系列、关键词扩展、品牌名统一、翻译修正、seed 数据修正）

### Phase 3（1 月+）
- P2 系列: 博客/资源中心、系列分类页、产品富文本、视频、Review schema、多语言关键词本地化
