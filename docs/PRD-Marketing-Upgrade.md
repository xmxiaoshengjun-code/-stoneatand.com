# 谦帆（厦门）工贸英文官网 — 营销能力升级 PRD

## 项目信息

- **Language**: 中文（面向国内团队），网站界面英文
- **Programming Language**: Next.js 14+ App Router + TypeScript + Tailwind CSS + shadcn/ui + Prisma + SQLite
- **Project Name**: `qianfan-website-marketing-upgrade`
- **原始需求复述**: 针对已上线的谦帆 B2B 外贸官网（瓷砖/石材展示架制造商，7 系列 55 SKU，80% 出口欧美），用户提出 9 项升级诉求：清除 "buy" 等 B2C 电商文案、加强后台功能、首页社媒分享与数据外链、符合当下 SEO/GEO 收录、智能客服、访客统计、页面留存与喜好分析、自动迭代 SEO/GEO、强化营销引流。

---

## 一、产品目标

1. **B2B 专业化**：彻底消除 B2C 电商语境（cart/buy/order now 等），全站文案统一为 B2B 外贸询盘场景（RFQ / Request Quote / Get Catalog / Consult），提升专业买家信任度。
2. **营销引流闭环**：构建「社媒分享 → SEO/GEO 自然流量 → 智能客服接待 → 询盘转化 → 后台跟进」的完整营销漏斗，使网站从"展示型"升级为"获客型"。
3. **数据驱动运营**：建立访客行为分析（来源、留存、热力、转化漏斗）与自动 SEO 迭代能力，让运营人员可基于数据持续优化获客效率。

---

## 二、用户故事

1. **As a** 海外瓷砖品牌采购经理，**I want** 在产品页一键分享到 LinkedIn/Facebook，**so that** 我能把候选展示架方案发给团队评审。
2. **As a** 首次访问的海外买家，**I want** 网站根据我的地区自动展示对应联系方式和案例，**so that** 我能快速判断谦帆是否服务过我的市场。
3. **As a** 谦帆销售人员，**I want** 后台能看到每个访客的来源渠道、浏览时长、兴趣产品，**so that** 我能优先跟进高意向客户。
4. **As a** 谦帆运营人员，**I want** 后台能管理 SEO 元数据、FAQ、社媒链接，并自动提交 sitemap，**so that** 我无需开发介入即可持续优化收录。
5. **As a** 海外买家，**I want** 智能客服能理解我的自然语言问题并推荐产品或转人工，**so that** 我能 7×24 获得即时响应而不必等待邮件。

---

## 三、需求池（P0 / P1 / P2）

### P0 — Must Have（本次必须交付）

| # | 需求 | 说明 |
|---|------|------|
| P0-1 | **清除全站 B2C 电商文案** | 详见下方专项清单 |
| P0-2 | **修复数据不一致** | seed.ts 中 "6 countries"/"16 years" 与全站 "80+ countries"/"18+ years" 冲突；tsianfan.com vs tsianfan.net 域名不一致 |
| P0-3 | **社媒分享组件** | 产品页、案例页、首页增加 LinkedIn / Facebook / X / WhatsApp / Email 分享按钮 + OG/Twitter Card 完整 meta |
| P0-4 | **Footer 社媒外链** | Footer 增加 LinkedIn、Facebook、YouTube、Instagram、X 社交媒体图标链接（当前完全缺失） |
| P0-5 | **后台仪表盘补全访客统计** | 当前 DashboardClient 获取了 tracking 数据但完全未展示；需展示：访客数、PV、产品浏览、询盘、聊天、来源国家、趋势图 |
| P0-6 | **访客行为追踪增强** | useTracking 补充：会话时长（duration）、来源 referrer/UTM、设备类型、滚动深度、退出页 |
| P0-7 | **页面留存时长分析** | 前端埋点上报 page_enter/page_leave 事件，后台聚合计算平均停留时长、跳出率 |
| P0-8 | **智能客服升级为 LLM 驱动** | 实现 llmProvider 实际调用（当前为占位 null），支持 OpenAI/兼容 API；客服对话能创建询盘、推荐产品、收集联系方式 |
| P0-9 | **后台 Content 模块完善** | Banner / Page / Testimonial / FAQ 增加列表、编辑、删除（当前只能新增）；FAQ 管理当前完全缺失 |
| P0-10 | **后台 Settings 功能化** | 当前"保存"仅 toast 提示 coming soon；需实现：站点信息编辑、社媒链接配置、SEO 默认配置、邮箱通知配置、密码修改 |
| P0-11 | **SEO 基础补全** | 全站 canonical URL、hreflang 多区域标签、完善 Open Graph image、Article/BreadcrumbList/AggregateRating 结构化数据、每页独立 meta description |
| P0-12 | **域名统一** | 统一为正式域名，消除 metadataBase(tsianfan.com) vs openGraph.url(tsianfan.net) vs SITE_CONFIG.url(tsianfan.net) 冲突 |

### P1 — Should Have（本次应尽量交付）

| # | 需求 | 说明 |
|---|------|------|
| P1-1 | **询盘转化漏斗分析** | 后台展示 访问→产品浏览→发起询盘 转化率漏斗 |
| P1-2 | **来源渠道分析** | 记录 referrer / UTM 参数，后台按渠道（Direct/Search/Social/Referral）统计流量与转化 |
| P1-3 | **热门内容排行** | 后台展示浏览量 Top 产品页、Top 案例页、搜索关键词 Top N |
| P1-4 | **GEO 区域内容差异化** | 基于 regionDetector 实现区域化：联系方式、案例、客户评价按北美/欧洲/亚洲切换；hreflang 对应 |
| P1-5 | **Lead Magnet 引流物** | 提供"2025 展示架选型手册 PDF"下载，需填邮箱获取；下载记录入库 |
| P1-6 | **Newsletter 邮件订阅** | Footer 邮件订阅入口，存入数据库，后台可管理订阅列表 |
| P1-7 | **后台 SEO 管理中心** | 可编辑各页面 meta title/description/keywords、结构化数据开关、查看 sitemap 状态、一键提交 Google/Bing |
| P1-8 | **客服会话管理** | 后台可查看聊天记录、对话转询盘、客服话术库管理 |
| P1-9 | **询盘导出与批量操作** | 后台询盘支持 CSV 导出、批量状态变更、批量分配 |
| P1-10 | **产品页营销增强** | "Download Spec Sheet"、"Add to Inquiry List"（替代 compare 中的 cart 用语）、相关推荐、最近浏览 |

### P2 — Nice to Have（后续迭代）

| # | 需求 | 说明 |
|---|------|------|
| P2-1 | **自动 SEO 迭代引擎** | 定时任务：分析 Search Console 数据、自动建议关键词优化、自动生成 meta、自动提交 sitemap |
| P2-2 | **热力图与会话回放** | 集成 Clarity/Hotjar 或自建，可视化点击热力与用户行为路径 |
| P2-3 | **A/B 测试框架** | 标题/CTA/布局多版本测试 |
| P2-4 | **博客/内容营销模块** | CMS 支持发布行业文章，自动生成 Article 结构化数据，提升长尾 SEO |
| P2-5 | **WhatsApp / Messenger 直连** | 社媒分享之外增加 WhatsApp Business API 深度集成 |
| P2-6 | **多语言支持** | 英文为主，增加西/法/德/意/葡语版本，配合 hreflang |
| P2-7 | **CRM 对接** | 询盘/客户数据同步 HubSpot/Salesforce |
| P2-8 | **退出意向弹窗** | 检测鼠标移出视口，弹出 Lead Magnet 或客服邀请 |

---

## 四、B2C 文案清除专项清单

以下为代码审查中发现的不适合 B2B 外贸场景的文案/用语：

### 4.1 代码注释与变量命名（影响开发者认知，需修正）
| 文件 | 位置 | 当前用语 | 建议改为 |
|------|------|----------|----------|
| `src/stores/compareStore.ts` | L5,7,9,11,13 | "comparison **cart**" | "comparison **list**" |
| `src/hooks/useCompare.ts` | L6 | "product comparison **cart**" | "product comparison **list**" |

### 4.2 种子数据文案（直接展示给用户）
| 文件 | 位置 | 当前文案 | 问题 | 建议 |
|------|------|----------|------|------|
| `prisma/seed.ts` | L199 | "We **ordered** the CC918 tall cabinet" | B2C 下单口吻 | "We **procured** the CC918 tall cabinet" 或 "The CC918 tall cabinet we **selected**" |
| `prisma/seed.ts` | L201 | "Will **order** again" | B2C 复购口吻 | "Will **partner with** them again" 或 "Highly recommend for future projects" |

### 4.3 需全局排查的 B2C 词汇（开发时用脚本扫描）
需在所有 `.tsx` / `.ts` / 种子数据 / CMS 内容中搜索并评估：
- `buy` / `Buy Now` / `Add to cart` / `Add to bag` / `checkout` / `shopping`
- `price` 在面向用户的 UI 中应改为 `Get Quote` / `Request Pricing`（聊天规则中的 price 关键词匹配可保留，因为是响应用户提问）
- `order` 在面向用户文案中改为 `inquiry` / `project` / `request`
- `shop` / `store` 作为购物含义时应改为 `showroom` / `catalog` / `collection`

### 4.4 建议增加的 B2B 专业用语
- 全站 CTA 统一为：`Request Quote` / `Get Catalog` / `Consult Expert` / `Download Spec Sheet` / `Talk to Sales`
- 询盘表单字段使用 B2B 语境：`Company Name` / `Job Title` / `Estimated Quantity` / `Project Type` / `Target Market`

---

## 五、后台需要补充的功能清单

### 5.1 Dashboard 仪表盘（当前缺陷最大）
- **[P0]** 展示访客统计（tracking 数据已获取但未渲染）：UV / PV / 产品浏览 / 询盘数 / 聊天数
- **[P0]** 访客来源国家分布（TrackingEvent.country 已记录但未聚合展示）
- **[P0]** 7/30 天趋势折线图
- **[P1]** 转化漏斗：访问 → 产品浏览 → 发起询盘
- **[P1]** 来源渠道分布（Direct/Search/Social/Referral）
- **[P1]** 热门产品 / 热门页面 / 热门搜索词排行

### 5.2 Content 内容管理（当前只能新增不能编辑删除）
- **[P0]** Banner：列表 + 编辑 + 删除 + 排序 + 发布开关（当前仅有新增表单）
- **[P0]** Page：列表 + 编辑 + 删除（当前仅有新增表单）
- **[P0]** Testimonial：列表 + 编辑 + 删除（当前仅有新增表单）
- **[P0]** FAQ 管理：列表 + 新增 + 编辑 + 删除（当前后台完全没有 FAQ 管理入口，FAQ 只存在于 seed）
- **[P1]** SEO 元数据管理：各页面 meta title / description / keywords / canonical / OG image 可编辑
- **[P1]** Sitemap 状态查看 + 一键提交搜索引擎

### 5.3 Settings 设置（当前全部是 "coming soon" 假按钮）
- **[P0]** 站点信息编辑（名称、域名、描述、联系方式、营业时间）
- **[P0]** 社媒链接配置（LinkedIn / Facebook / YouTube / Instagram / X / WhatsApp）
- **[P0]** 邮箱通知配置（SMTP 设置、通知接收邮箱、询盘通知开关）
- **[P0]** 密码修改（当前假按钮）
- **[P1]** SEO 默认配置（默认 meta、结构化数据开关、robots 指令）
- **[P1]** AI 客服配置（API Key、模型选择、系统提示词、欢迎语）
- **[P1]** GEO 区域配置（区域列表 CRUD、区域联系方式、区域案例关联）

### 5.4 Inquiries 询盘管理
- **[P1]** CSV 导出
- **[P1]** 批量状态变更 / 批量分配
- **[P1]** 询盘来源渠道标记（表单 / 聊天 / WhatsApp）
- **[P1]** 询盘评分/意向度标记

### 5.5 客服会话管理（当前缺失）
- **[P1]** 聊天记录查看
- **[P1]** 对话转询盘
- **[P1]** 客服话术库 / 快捷回复管理

### 5.6 订阅 / Lead Magnet 管理（新增模块）
- **[P1]** Newsletter 订阅者列表 + 导出
- **[P1]** 资料下载记录列表

---

## 六、营销 / SEO / GEO / 分析 / 客服功能清单

### 6.1 社交媒体与分享
- **[P0]** 产品页分享按钮组（LinkedIn / Facebook / X / WhatsApp / Email / Copy Link）
- **[P0]** 案例页分享按钮
- **[P0]** Footer 社媒图标外链区（当前完全缺失）
- **[P0]** 完善 Open Graph + Twitter Card meta（含 OG image、url 修正）
- **[P1]** 社交分享数据追踪（分享次数统计）

### 6.2 SEO 增强
- **[P0]** Canonical URL 全站覆盖
- **[P0]** hreflang 多区域标签
- **[P0]** 结构化数据完善：Organization（补 logo/sameAs 社媒链接）、Product（补 brand/offers/aggregateRating）、BreadcrumbList、WebSite（SearchAction）
- **[P0]** 每页独立 meta description（当前多数页面缺失）
- **[P0]** 域名统一（消除 .com / .net 冲突）
- **[P1]** 后台 SEO 管理中心（meta 可编辑 + sitemap 提交）
- **[P1]** robots.txt 增强（crawl-delay、分区域规则）
- **[P2]** 自动 SEO 迭代引擎（Search Console 数据分析 + meta 自动优化 + sitemap 自动提交）
- **[P2]** 博客/内容营销模块（长尾关键词覆盖）

### 6.3 GEO 区域化
- **[P0]** hreflang 标签与区域映射
- **[P1]** 区域化内容：联系方式、案例、客户评价按北美/欧洲/亚洲/全球切换
- **[P1]** 区域化货币/计量单位提示（非价格，仅参考）
- **[P2]** 多语言版本（EN/ES/FR/DE/IT/PT）

### 6.4 访客分析与留存
- **[P0]** 会话时长追踪（page_enter / page_leave 埋点 + duration 计算）
- **[P0]** 跳出率计算
- **[P0]** 来源追踪（referrer / UTM 参数）
- **[P0]** 设备类型追踪（mobile / desktop / tablet）
- **[P0]** 后台访客统计仪表盘（UV / PV / 趋势 / 国家分布）
- **[P1]** 滚动深度追踪
- **[P1]** 热门内容排行
- **[P1]** 转化漏斗分析
- **[P2]** 热力图与会话回放（集成 Clarity/Hotjar）
- **[P2]** A/B 测试

### 6.5 智能客服
- **[P0]** LLM 驱动对话（实现 llmProvider 实际调用，当前返回 null）
- **[P0]** 客服可收集联系方式并创建询盘
- **[P0]** 产品推荐与规格匹配（保留现有规则引擎作为快速通道）
- **[P1]** 人工转接 / 离线留言
- **[P1]** 多轮对话上下文记忆
- **[P1]** 主动邀请弹窗（停留 >30s 或滚动 >50% 时触发）
- **[P1]** 后台客服会话管理 + 话术库
- **[P2]** 多语言客服

### 6.6 营销引流
- **[P1]** Lead Magnet（选型手册 PDF 下载换邮箱）
- **[P1]** Newsletter 邮件订阅
- **[P1]** 退出意向弹窗
- **[P1]** WhatsApp 浮动按钮（已有，需增强为 WhatsApp Business 深度链接）
- **[P2]** Retargeting 像素（Meta Pixel / Google Ads）
- **[P2]** CRM 对接

---

## 七、待确认问题

1. **正式域名**：当前代码混用 `tsianfan.com` 和 `tsianfan.net`，请确认正式对外域名，所有 SEO 配置需统一。
2. **AI 客服模型选型**：LLM Provider 预留了 OpenAI 接口。请确认使用哪家 LLM（OpenAI / DeepSeek / 通义千问 / 其他）？是否需要在国内可访问的方案？
3. **社媒账号**：LinkedIn / Facebook / YouTube / Instagram / X 的官方账号链接 URL 请提供，Footer 需配置。
4. **Lead Magnet 素材**：是否已有"选型手册 PDF"或其他可下载资料？若无，是否需要设计制作？
5. **SMTP 邮箱**：询盘通知邮件的发送 SMTP 配置（服务器/端口/账号）请提供。当前 nodemailer 已安装但未配置。
6. **分析工具偏好**：访客分析是用自建追踪（当前方案）还是集成第三方（Google Analytics 4 / Microsoft Clarity）？建议自建 + Clarity 并行。
7. **多语言优先级**：如果做多语言，除英文外优先哪些语种？（建议按出口市场：西班牙语、法语、德语、意大利语、葡萄牙语）
8. **自动 SEO 迭代**：是否有 Google Search Console / Bing Webmaster Tools 账号可接入？
9. **预算与排期**：P0 需求较多，是否需要分批次交付？建议第一批先交付文案清除 + 社媒 + 仪表盘 + 客服升级，第二批交付分析增强 + GEO + 后台完善。
10. **种子数据中的数据矛盾**（6 countries vs 80+ countries、16 years vs 18+ years）请确认正确数值，需同步修正全站。

---

*本 PRD 基于对 `qianfan-website` 全代码库的逐文件审查，覆盖文案、页面结构、后台功能、SEO/GEO、分析追踪、客服系统六大维度。建议架构师据此评估技术方案与工作量。*
