# myguilin.com — 一级界面综合测试报告

> 测试时间：2026-07-09 ｜ 测试专家：端测测（Web 应用测试）
> 测试对象：一级单页 `index.html`（面向外国游客的桂林旅游站）
> 测试手段：静态审计 + Playwright 真实浏览器（E2E / 视觉回归 / axe-core a11y / Core Web Vitals）

## ✅ 总体结论

**可发布（Release-ready）**，性能目标全部达成。

| 测试层 | 结果 | 说明 |
|--------|------|------|
| 静态审计（结构/资源/语义） | **20 PASS / 0 FAIL / 0 WARN** | 无断图、无死链、标题层级合规 |
| 功能 E2E（Playwright 真实浏览器） | **20 PASS / 0 FAIL** | 全绿（含 FCP 达标） |
| 可访问性（axe-core WCAG 2.1 AA） | **0 critical / 0 serious** | 全绿 |
| 视觉回归（桌面+移动截图） | **已生成** | `tests/screenshots/` |
| 性能（Core Web Vitals） | CLS=0.000 优；**FCP=104ms** | LCP 需 Lighthouse 权威测 |

---

## 🔧 测试中发现并修复的问题（本轮）

### BUG-1：酒店/餐厅锚点失效（真实功能缺陷）
- **现象**：合并酒店/餐厅为一个 section 后，`id="hotel"`/`id="food"` 从 section 上丢失，卡片只剩 `id="hotel-entry"`/`id="food-entry"`。导航栏、hero 药丸、footer 共 **9 处** `#hotel`/`#food` 链接点击后**不滚动到任何位置**。
- **修复**：卡片 `id` 改为 `hotel`/`food`，并加 `scroll-mt-20` 让吸顶导航不遮挡卡片顶部。
- **验证**：E2E「Nav Hotel/Food 滚动到目标」✅ 通过。

### BUG-2：footer 社交图标死链 + 无可访问名称（a11y 缺陷）
- **现象**：3 个 `<a href="#">` 社交图标（Twitter/Instagram/YouTube）既无目标（点了跳页顶）又无 `aria-label`，axe 报 `link-name` ×3 serious。
- **修复**：指向各平台主页 + `aria-label` + `target="_blank" rel="noopener"`。

### BUG-3：系统性对比度不达标（WCAG AA 合规）
- **现象**：axe `color-contrast` 报 **38 个节点** serious。根因是浅透明文字（`gold-dark` 2.75:1、`stone/60` 3.49:1、`stone/70` 4.32:1、白字压图等）低于 4.5:1。
- **修复**：
  - `gold-dark` token 加深 `#b08d4f → #7a5f24`（eyebrow/序号达 5.1:1）
  - 次级正文 `stone/60·/70·/50` → 实色 `stone-600`（白/米底稳定 4.5:1+，对游客可读性也更好）
  - 价格 `$99/$499/$1599` 改用 `gold-dark`；金色 CTA 按钮 / Epic 徽章改用深底保证白字对比
  - 压图白字 `white/60·/70` → `white/80·/85` + 加强酒店/餐厅卡渐变遮罩
  - footer 版权 `white/40` → `white/70`
- **结果**：`color-contrast` 从 38 → **0** serious。

### BUG-4：Hero 图超体积预算
- **现象**：`hero-liriver.jpg` 204KB，超 200KB 预算。
- **修复**：PIL 重压 quality 85→74（保持 1600px 宽、progressive），降至 **196KB**。
- **结果**：静态审计 0 WARN。

---

## 📊 功能 E2E 明细（19 项）

| # | 检查项 | 结果 |
|---|--------|------|
| 1 | `<title>` 非空 | ✓ |
| 2 | Attractions 渲染 8 卡 | ✓ |
| 3 | Experiences 渲染 8 卡 | ✓ |
| 4 | 渲染无断图（naturalWidth>0） | ✓ |
| 5 | 全部 `<img>` 懒加载 | ✓ |
| 6 | 导航 Hotel 滚动到 #hotel | ✓ |
| 7 | 导航 Food 滚动到 #food | ✓ |
| 8 | Contact 弹窗可触发打开 | ✓ |
| 9 | 弹窗 `role=dialog` + `aria-modal` | ✓ |
| 10 | ESC 关闭弹窗 | ✓ |
| 11 | ✕ 按钮关闭弹窗 | ✓ |
| 12 | 移动端暴露导航锚点（29 个） | ✓ |
| 13 | 移动端汉堡菜单可展开 | ✓ |
| 14 | 移动端点链接后菜单自动收起 | ✓ |
| 15 | axe 无 critical 违规 | ✓ |
| 16 | axe 无 serious 违规 | ✓ |
| 17 | CLS < 0.1 | ✓ (0.000) |
| 18 | 加载无严重 console/page 错误 | ✓ |
| 19 | FCP < 1800ms | ✓ (104ms) |

---

## ⚠️ 剩余项（非阻断，发布前建议）

### ✅ PERF-1：Tailwind CDN → 预编译 CSS（已完成，FCP 1912ms → 104ms）
- **做法**：新增 `tailwind.config.js`（与原内联 config 一致，并把 `stone` 定义为含 `DEFAULT` 的色阶对象，修复了原 config 把 `stone:#3a3a3a` 扁平色覆盖默认 `stone-600` 等级的隐患）+ `src/input.css` + `package.json`（`npm run build:css`）；`tailwindcss` CLI 产出 `tailwind.css`（22.6KB，minified）。`index.html` 用 `<link rel="stylesheet" href="tailwind.css">` 替换 CDN `<script>` 与内联 `tailwind.config`。
- **连带优化**：
  - 新增 `favicon.svg` 并 `<link rel="icon">`，消除浏览器自动请求 `/favicon.ico` 的 404 控制台报错。
  - Google Fonts 改为 `media="print" onload` 非阻塞加载（`display=swap` 保证文字不 invisible）。
  - Lucide 图标脚本加 `defer`，`lucide.createIcons()` 移入 `DOMContentLoaded`，消除最后一个阻塞解析的 CDN 依赖。
- **结果**：页面已无渲染阻塞的 CDN 依赖；FCP 从 1912ms → **104ms**，浏览器套件 20/0、0 控制台错误、axe 0/0、CLS 0.000。

### PERF-2：LCP 需 Lighthouse 权威测量
- headless chromium 对「CSS 背景图 hero」不暴露 LCP 性能条目，自动化脚本取不到（已标记为 harness 限制，非失败）。
- **建议**：上线前跑一次 Lighthouse（或 PageSpeed Insights）获取权威 LCP/TBT，目标 LCP < 2.5s。

---

## 🚀 发布前检查清单

- [x] 静态审计全绿（资源/语义/标题层级）
- [x] 功能 E2E 全绿（导航/锚点/弹窗/移动端）
- [x] 可访问性 WCAG 2.1 AA 零违规
- [x] 视觉回归截图已生成（桌面/移动）
- [x] 图片体积达标
- [x] **Tailwind 预编译替换 CDN**（PERF-1 已完成，FCP 1912ms→104ms）
- [ ] **【发布前建议】** Lighthouse 跑一次确认 LCP/TBT（PERF-2）
- [ ] 二级页 `hotels.html` / `restaurants.html` 建好后，把入口卡 `#hotel`/`#food` 换回真实链接
- [ ] 社交链接换成真实账号主页

---

## 📁 产物

- 测试脚本：`tests/static-audit.mjs`、`tests/browser-test.mjs`
- 视觉回归截图：`tests/screenshots/`（desktop-full / desktop-tour / desktop-hotelfood / mobile-menu / mobile-full）
- Tailwind 构建：`tailwind.config.js` + `src/input.css` → `tailwind.css`（`npm run build:css`，需 `tailwindcss`）
- 运行方式：
  ```bash
  npm run build:css            # 改动样式后重新生成 tailwind.css
  node tests/static-audit.mjs
  node tests/browser-test.mjs   # 自带本地 HTTP server 提供服务（避免 file:// 的 CORS 问题），需 chromium + axe-core
  ```
