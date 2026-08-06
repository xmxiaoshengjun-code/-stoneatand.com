# 增量 PRD: 产品列表页 UX 优化与页面修复

> 文档版本: v1.0  
> 日期: 2026-08-04  
> 状态: 待评审  
> 关联项目: qianfan-website (Next.js 14 + TypeScript + Tailwind + shadcn/ui + Prisma + SQLite)

---

## 1. 项目信息

| 项目 | 内容 |
|------|------|
| 编程语言 | TypeScript (Next.js 14 App Router) |
| UI 框架 | Tailwind CSS + shadcn/ui |
| 多语言 | EN / FR / DE / IT / ES |
| 当前状态 | 刚完成产品分类层级重构，DB Series 表 25 条记录（10 父分类 + 15 子系列），172 个产品 |
| 原始需求 | 修复旧 slug 访问 0 结果问题；产品列表页参考 insca.com 二级类目布局重构；spec-finder 空页填充；projects 页布局重构 |

## 2. 产品目标

1. **消除死链**：旧 slug URL 通过 301 重定向到新 slug，用户和搜索引擎不再遇到 "0 products found" 空页面。
2. **提升分类浏览体验**：产品列表页在父分类层级展示标题/描述/子系列卡片矩阵，帮助用户快速定位目标产品系列，参考 insca.com/en/displays/ 的视觉层级。

## 3. 用户故事

1. **作为采购商**，我希望点击导航中的产品分类（如 "Tile Displays Rack"）后看到一个清晰的分类落地页，包含分类标题、描述和子系列卡片，以便快速了解该分类下有哪些产品系列可选择。
2. **作为老用户/搜索引擎爬虫**，我希望访问旧 URL（如 `/products?series=tile-display`）时自动跳转到新 URL（`/products?series=tile-displays-rack`），而不是看到空结果页。
3. **作为展厅设计师**，我希望访问 spec-finder 页面时能输入瓷砖尺寸快速匹配展示架，并在 projects 页面看到有图片的案例展示，以便做出采购决策。

## 4. 需求池

### P0 — 必须完成

| # | 需求 | 验收标准 | 涉及页面 |
|---|------|----------|----------|
| P0-1 | 旧 slug 301 重定向 | 访问 `/en/products?series=tile-display` 返回 HTTP 301 并跳转到 `/en/products?series=tile-displays-rack`；所有已知旧 slug 均有对应重定向规则；旧 URL 不再出现 "0 products found" | `next.config.mjs` redirects / `middleware.ts` |
| P0-2 | 产品列表页父分类视图 | 当 `?series=<parentSlug>` 时，页面顶部显示父分类名称（如 "Tile Displays Rack"）和描述；下方渲染子系列卡片网格（图片 + 系列名 + 简短描述 + 链接）；点击卡片进入 `?series=<childSlug>` 产品列表 | `products/page.tsx`, `products/ProductListClient.tsx` |
| P0-3 | spec-finder 页面功能可用 | 页面正常渲染搜索表单（尺寸输入 + 厚度选择 + 预设按钮）；API `/api/products/spec-finder` 返回正确匹配结果；无结果时显示引导文案 | `spec-finder/page.tsx`, `spec-finder/SpecFinderClient.tsx`, `api/products/spec-finder/route.ts` |
| P0-4 | projects 页布局重构 | 页面顶部有 hero 区（标题 + 描述 + 背景图）；下方项目卡片包含图片缩略图（非纯文字）；卡片网格参考 insca.com 视觉层级 | `projects/page.tsx` |

### P1 — 应该完成

| # | 需求 | 验收标准 | 涉及页面 |
|---|------|----------|----------|
| P1-1 | Middleware 集成 DB 重定向 | `middleware.ts` 查询 `Redirect` 表，对匹配 `sourceUrl` 的请求执行 301 跳转；Admin 后台添加的规则实时生效 | `middleware.ts`, `redirectService.ts` |
| P1-2 | 子系列视图标题区分 | 当 `?series=<childSlug>` 时，页面标题显示子系列名称（如 "Wall Sliding Rack"）和描述，而非 "All Products"；面包屑显示 Home > Products > 父分类 > 子系列 | `products/page.tsx`, `products/ProductListClient.tsx` |
| P1-3 | 父分类视图响应式布局 | 子系列卡片在移动端 1 列、平板 2 列、桌面 3-4 列；卡片高度一致，图片比例统一 | `products/ProductListClient.tsx` |
| P1-4 | projects 卡片图片支持 | Project 模型支持 `imageUrl` 字段（或复用已有图片字段）；卡片展示项目图片 | `projects/page.tsx`, `prisma/schema.prisma` |

### P2 — 可以做

| # | 需求 | 验收标准 | 涉及页面 |
|---|------|----------|----------|
| P2-1 | spec-finder 增加引导内容 | 搜索表单上方增加使用说明（3 步引导）；无结果时推荐 "Contact us for custom solutions" CTA | `spec-finder/SpecFinderClient.tsx` |
| P2-2 | projects 页增加分类筛选 | 按项目类型/区域筛选；insca.com 风格的 tab 或 filter bar | `projects/page.tsx` |
| P2-3 | 父分类视图增加产品计数 | 每个子系列卡片显示该系列下产品数量（如 "Wall Sliding Rack · 28 products"） | `products/ProductListClient.tsx` |

## 5. UI 结构描述

### 5.1 产品列表页 — 父分类视图（参考 insca.com/en/displays/）

当 `?series` 匹配 `PARENT_CATEGORIES` 中的 slug 时，渲染父分类落地页：

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb: Home > Products > Tile Displays Rack    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Tile Displays Rack                          [大标题] │
│  Display racks and stands for ceramic and           │
│  porcelain tiles, including wall sliding racks,     │
│  drawer cabinets, combination frames, and more.     │
│                                           [分类描述]  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │
│  │ [Image] │  │ [Image] │  │ [Image] │  │[Image] │ │
│  │         │  │         │  │         │  │        │ │
│  ├─────────┤  ├─────────┤  ├─────────┤  ├────────┤ │
│  │ Wall    │  │ Drawer  │  │ Combin- │  │ Page-  │ │
│  │ Sliding │  │ Cabinet │  │ ation   │  │ turning│ │
│  │ Rack    │  │         │  │ Frame   │  │ Stand  │ │
│  ├─────────┤  ├─────────┤  ├─────────┤  ├────────┤ │
│  │ Sliding │  │ Drawer  │  │ Modular │  │ Flip-  │ │
│  │ racks.. │  │ cabinets│  │ display │  │ page.. │ │
│  └─────────┘  └─────────┘  └─────────┘  └────────┘ │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │ [Image] │  │ [Image] │  │ [Image] │             │
│  │ Reclin- │  │ Simple  │  │ Floor-  │             │
│  │ ing     │  │ Frame   │  │ standing│             │
│  └─────────┘  └─────────┘  └─────────┘             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**卡片结构**：
- 图片区域：使用子系列 `heroImage`，比例 4:3，圆角
- 标题：子系列 `name`（如 "Wall Sliding Rack"）
- 描述：子系列 `shortDescription`（1 行，截断）
- 链接：点击卡片跳转 `?series=<childSlug>`
- Hover 效果：阴影提升 + 图片轻微缩放

**数据源**：从 `SERIES_INFO` 中筛选 `parentSlug === currentParentSlug` 的子系列。

### 5.2 产品列表页 — 子系列视图（保持现有，优化标题）

当 `?series` 匹配 `SERIES_INFO` 中的 slug 时：

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb: Home > Products > Tile Displays Rack    │
│              > Wall Sliding Rack                    │
├─────────────────────────────────────────────────────┤
│  Wall Sliding Rack                          [标题]   │
│  Wall-mounted sliding display racks for large       │
│  format tiles 800mm+.                               │
├──────────────┬──────────────────────────────────────┤
│              │  28 products found      [Sort ▾]     │
│  [Filter     │                                      │
│   Panel]     │  ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│              │  │    │ │    │ │    │ │    │        │
│  - Series    │  │ P1 │ │ P2 │ │ P3 │ │ P4 │        │
│  - Panel Size│  │    │ │    │ │    │ │    │        │
│  - Thickness │  └────┘ └────┘ └────┘ └────┘        │
│              │  ... (pagination)                    │
└──────────────┴──────────────────────────────────────┘
```

### 5.3 Projects 页布局（参考 insca.com 视觉层级）

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         Our Projects                       [Hero]   │
│  Real-world installations showcasing our display    │
│  solutions across the globe.                        │
│                                                     │
│  [背景图 / 渐变遮罩]                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ [Image]  │  │ [Image]  │  │ [Image]  │         │
│  │          │  │          │  │          │         │
│  ├──────────┤  ├──────────┤  ├──────────┤         │
│  │ Title    │  │ Title    │  │ Title    │         │
│  │ 📍 Loc   │  │ 📍 Loc   │  │ 📍 Loc   │         │
│  │ 📅 Date  │  │ 📅 Date  │  │ 📅 Date  │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  ... (grid)                                         │
└─────────────────────────────────────────────────────┘
```

**改动要点**：
- 新增 hero 区（背景图 + 渐变遮罩 + 居中标题/描述）
- 卡片增加图片区域（顶部，4:3 比例）
- 保留现有的 location/date meta 信息

### 5.4 spec-finder 页面（修复 + 优化）

当前 `SpecFinderClient` 组件已存在搜索表单逻辑，需确认：
1. API `/api/products/spec-finder` 端点是否存在且正常返回
2. 页面渲染是否有 hydration/SSR 错误导致空白

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb: Home > Spec Finder                      │
├─────────────────────────────────────────────────────┤
│  [Smart Tool]                                       │
│  Spec Finder                                        │
│  Enter your tile dimensions and thickness...        │
├─────────────────────────────────────────────────────┤
│  ┌─ Card: Enter Your Tile Specifications ─────────┐ │
│  │  Quick Select: [600x1200] [800x800] [300x600] │ │
│  │                                                │ │
│  │  Width(mm)*  Height(mm)*  Thickness(mm)       │ │
│  │  [______]    [______]    [Any ▾]              │ │
│  │                                                │ │
│  │  [🔍 Find Matching Racks]                     │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ Results ──────────────────────────────────────┐ │
│  │  Found 3 matching product(s)                   │ │
│  │  ┌────┐ ┌────┐ ┌────┐                         │ │
│  │  │ SKU│ │ SKU│ │ SKU│  (match score badge)    │ │
│  │  │ Name││ Name││ Name│                        │ │
│  │  │ ✓ reason││ ✓ reason││ ✓ reason│            │ │
│  │  │ [View]││ [View]││ [View]│                  │ │
│  │  └────┘ └────┘ └────┘                         │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## 6. 旧 Slug 重定向方案建议

### 6.1 方案 A: next.config.mjs 硬编码（推荐 P0 快速修复）

在 `next.config.mjs` 的 `redirects()` 函数中添加规则。由于 Next.js redirects 不直接支持 query string 匹配，需要使用 `has` 条件：

```javascript
{
  source: '/products',
  has: [{ type: 'query', key: 'series', value: 'tile-display' }],
  destination: '/products?series=tile-displays-rack',
  permanent: true, // 301
},
```

**已知旧 slug → 新 slug 映射**（需与实际旧数据确认）：

| 旧 slug | 新 slug (parent) | 说明 |
|---------|-------------------|------|
| `tile-display` | `tile-displays-rack` | 瓷砖展示架 |
| `stone-display` | `stone-displays-rack` | 石材展示架 |
| `wood-display` | `wooden-flooring-display-rack` | 木地板展示架 |
| `door-window-display` | `door-and-window-display-racks` | 门窗展示架 |
| `sample-box` | `samples-box-books-display` | 样品箱册 |
| `mdf-display` | `mdf-board-displays` | 密度板展示 |
| `carpet-display` | `carpet-display-rack` | 地毯展示架 |
| `bathroom-display` | `bathroom-displays` | 卫浴展示 |
| `mosaic-display` | `mosaic-display-rack` | 马赛克展示架 |
| `painting-display` | `painting-sample-display-rack` | 涂料样品展示 |

> ⚠️ 上表为推测映射，需确认实际旧 slug 列表。可通过 Google Search Console 或旧 sitemap 获取已索引的旧 URL。

### 6.2 方案 B: Middleware 集成 DB 重定向（P1 长期方案）

项目已有 `Redirect` 模型 + `redirectService.getActiveRedirects()` + Admin 后台管理界面，但 `middleware.ts` 未调用。建议：

1. 在 `middleware.ts` 中增加 redirect 匹配逻辑（在 locale 路由之后）
2. 使用内存缓存（如 `globalThis.__redirectsCache`）避免每次请求查库，设置 TTL（如 5 分钟）
3. 匹配规则：`sourceUrl` 支持 query string 模式匹配

### 6.3 推荐实施顺序

1. **P0**: 方案 A — 在 `next.config.mjs` 中硬编码已知旧 slug 重定向（立即生效，无需 DB 查询）
2. **P1**: 方案 B — Wire middleware 查询 `Redirect` 表，实现 Admin 后台动态管理

## 7. 待确认问题

1. **旧 slug 完整列表**：上表中的旧 slug 是基于命名规律推测的。是否可以通过旧 sitemap、Google Search Console 或 git 历史获取准确的旧 slug 列表？是否还有子系列级别的旧 slug 需要重定向？
2. **Projects 图片数据**：当前 Project 模型是否有图片字段？如果没有，是否需要新增 `imageUrl` 字段到 Prisma schema？现有的项目数据是否已有图片可用，还是需要后续补充？
3. **spec-finder API 状态**：用户反馈 spec-finder 页面为空/错误。当前 `SpecFinderClient.tsx` 代码看起来完整，API 端点 `/api/products/spec-finder` 是否存在且可用？需要开发者确认是 API 缺失还是前端渲染错误导致空白。

---

## 附: 参考网站分析摘要

### insca.com/en/displays/
- **顶部**：大标题 "Displays for tiles, laminates and sanitary ware" + 一段描述
- **主体**：系列卡片网格，每个卡片 = 系列名（链接）+ 1 行简短描述，无图片（纯文字链接列表形式）
- **底部**：服务介绍区（编号列表：Pre-assembled furniture / Customised design 等）
- **视觉风格**：极简、大量留白、白底、无卡片边框

### insca.com/en/（首页）
- Hero 区：大标题 + 副标题 + CTA
- 四个分类入口卡片（Displays / Showroom / Stands / Corner），带图片
- 价值主张区（5 个要点）
- 数据展示区（26k m² 工业产能 / 45 年经验 / 200+ 团队 / 100+ 国家）
- 客户评价区（星级评分 + 公司名 + 国家）

### 与当前项目的差异
- insca.com 的 displays 页是**纯文字系列列表**，而用户要求的是**带图片的卡片矩阵**（更接近 insca.com 首页的分类卡片风格）
- 当前项目产品页固定标题 "All Products"，无分类/系列上下文
- 当前 projects 页卡片无图片，insca.com 首页分类卡片均有图片
