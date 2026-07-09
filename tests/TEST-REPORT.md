# myguilin.com — 一级界面综合测试报告

> 测试时间：2026-07-09 ｜ 测试专家：端测测（Web 应用测试）
> 测试对象：一级单页 `index.html`（面向外国游客的桂林旅游站）
> 测试手段：静态审计 + Playwright 真实浏览器（E2E / 视觉回归 / axe-core a11y / Core Web Vitals）

## ✅ 总体结论

**可发布（Release-ready）**，性能目标全部达成。

| 测试层 | 结果 | 说明 |
|--------|------|------|
| 静态审计（结构/资源/语义） | **19 PASS / 0 FAIL / 1 WARN** | 无断图、无死链、标题层级合规（WARN=hero 故意 eager 非 lazy） |
| 功能 E2E（Playwright 真实浏览器） | **20 PASS / 0 FAIL** | 全绿（含 FCP/LCP 达标） |
| 可访问性（axe-core WCAG 2.1 AA） | **0 critical / 0 serious** | 全绿 |
| 视觉回归（桌面+移动截图） | **已生成** | `tests/screenshots/` |
| 字体加载（自研校验） | **PASS** | 9 个 woff2 全 HTTP 200，零外部字体请求 |
| 外部依赖校验（自研） | **PASS** | 零运行时第三方请求（Lucide 已 vendor 本地，unpkg 残留 0） |
| SEO / 结构化数据 | **就绪** | OG×7 + Twitter Card + canonical + theme-color + JSON-LD(TravelAgency) |
| 无障碍增强 | **就绪** | skip-to-content 跳转 + `<main>` 地标 + prefers-reduced-motion 守卫 |
| 性能（Core Web Vitals） | CLS=0.000 优；**FCP=152ms / LCP=152ms** | LCP 远低于 2.5s |

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

---

## 🚀 一级界面优化（2026-07-09 第二轮）

目标：在不损失清晰度的前提下降低图片体积、改善 LCP。改动范围仅限一级单页 `index.html` + `images/`，**未动二级页**（按约定暂未开始）。

### 改动清单
- **图片转 WebP**：28 张 JPG → 高码率(q82) WebP，原 JPG 保留作 `<picture>` 兜底；大图（hero/band）额外生成 800w 响应式变体。
- **hero 由 CSS 背景图改为真实 `<picture>`**：`fetchpriority="high"` + `srcset`(800w/1600w) + JPG 兜底。收益：LCP 可被真实测量、可加优先级、有 SEO alt、CSS 失败不丢图。
- **移除 `background-attachment: fixed`**（`.hero-bg`/`.band-bg`）：消除 iOS Safari 不支持 + 滚动重绘卡顿（移动端 INP/滚动流畅度）。
- 背景图 `url('x.jpg')` → `url('x.webp')`。

### 复测结果（全绿）
| 测试层 | 结果 |
|--------|------|
| 静态审计 | **19 PASS / 0 FAIL / 1 WARN**（WARN=hero 故意 eager 非 lazy，符合 LCP 预期） |
| 功能 E2E + a11y + 视觉回归（Playwright） | **20 PASS / 0 FAIL** |
| axe-core WCAG 2.1 AA | 0 critical / 0 serious |
| Core Web Vitals | **LCP=244ms** / FCP=108ms / CLS=0.000 |

> LCP 此前 headless 抓不到（CSS 背景图限制，原 PERF-2）；hero 改真实 `<img>` 后现已可测，244ms 远低于 2.5s 目标。

### 清晰度核验（重点：转图后是否仍清晰）
- **逐图感知差分**（0–255 标度，<3 即人眼不可分辨）：均值 **0.79–2.16** → 全部不可分辨。
- **整页像素级 diff**（同页 WebP 渲染 vs 强制 JPG 渲染）：通道均值差 **0.27/255**，判定 **VISUALLY LOSSLESS ✓**（max 255 仅出现在极少数高反差边缘像素，属不同编解码器正常噪声，不可感知）。

### 体积收益
- 图片总体积：**2036KB → 1717KB（省 15.7%）**。注：源 JPG 本已压过，故增益偏温和；但格式切换 + hero 移动端 `srcset`（不再下载 1600px 大图）的真实体验收益更大。

### 测试工具增强（scripts/，可复现）
- `scripts/optimize-images.py`：JPG→WebP + 响应式变体 + 感知差分自检。
- `scripts/optimize-html.py`：`<img>`→`<picture>` + 背景图切 WebP。
- `scripts/visual-diff.mjs` + `scripts/diff-screenshots.py`：WebP vs JPG 整页像素级对比。
- `tests/static-audit.mjs`：T8 现理解 WebP 同名兜底（不再误报死文件）。
- `tests/browser-test.mjs`：补 LCP `PerformanceObserver`（解决原 PERF-2）；非 hero 图片才要求 lazy（hero 豁免，因 LCP 须 eager）。

### 仍待办（非本轮范围，部分已在第三轮完成）
- [x] ~~`.gitignore`~~ 已于第三轮修复（见下）。
- [ ] Lucide 仍用 `unpkg.com/lucide@latest` 未锁版本（生产定时炸弹）→ pin 或 vendor。
- [ ] 二级页 `hotels.html` / `restaurants.html` 待建（按约定本轮未动）。
- [ ] 社交链接为平台首页占位，非真实账号。

---

## 🚀 一级界面优化（2026-07-09 第三轮）

目标：消除剩余运行时第三方依赖、确定性压低 LCP、加固部署卫生。改动范围仅限一级单页 `index.html`、`fonts/`、`_headers`、`.gitignore`，**未动二级页**。

### 改动清单
- **字体本地化（self-host）**：移除 Google Fonts（googleapis/gstatic 两个外部域名），改用 `@fontsource` 提供的 woff2 落地到 `fonts/`（Inter 300–700 + Playfair Display 400/600/700 + 400 italic，latin 子集，共 ~206KB）。`index.html` 改引 `fonts/fonts.css`，并 `preload` 关键字体（Inter 400、Playfair 700）。收益：① 零运行时第三方依赖 → 更稳、弱网/离线不依赖外网；② 欧盟游客 GDPR 友好（规避 Google Fonts 隐私争议）；③ 可对首屏字体做 preload。
- **hero 加 `preload as=image`**：`<link rel="preload" as="image" href="images/hero-liriver.webp" fetchpriority="high">`，让 LCP 图下载更早更确定。
- **`_headers`（GitHub Pages）**：静态资源（`/fonts` `/images` `/*.css` `/*.svg`）设 `Cache-Control: public, max-age=31536000, immutable`；HTML `no-cache`；全站加 `Referrer-Policy` / `X-Content-Type-Options` / `X-Frame-Options` / `Permissions-Policy` 安全头。
- **`.gitignore` 真 bug 修复**：原第 1 行把 7 个规则用空格挤在一行。gitignore 是「**一行一个模式**」，空格被当成文件名一部分 → 整行失效（node_modules 等全未被忽略，`git status` 显示 `?? node_modules` 死符号链接，会被误提交到 Pages 仓库）。改为每行一个后，`node_modules` 已被正确忽略（`git check-ignore` exit=0，git status 已干净）。

### 复测结果（全绿）
| 测试层 | 结果 |
|--------|------|
| 静态审计 | **19 PASS / 0 FAIL / 1 WARN**（WARN=hero 故意 eager 非 lazy） |
| 功能 E2E + a11y + 视觉回归（Playwright） | **20 PASS / 0 FAIL** |
| axe-core WCAG 2.1 AA | 0 critical / 0 serious |
| Core Web Vitals | **LCP=156ms** / FCP=156ms / CLS=0.000 |
| 字体加载（自研校验） | `fonts.css`+9 个 woff2 全部 HTTP 200，无 >=400 响应；`document.fonts` 已应用，零外部请求 |

> LCP 由上一轮 244ms 进一步降至 **156ms**（hero preload 贡献）。Google Fonts 外部引用数：1 → **0**。

### 测试工具增强（scripts/，可复现）
- `scripts/verify-fonts.mjs`：起本地 server + Playwright 加载，断言字体 CSS/woff2 全部 200、无 >=400 响应、`document.fonts` 已应用——专门防「@font-face 路径写错导致静默回退系统字体」这类不报错但排版错的坑。

### 仍待办（非本轮范围）
- [x] ~~Lucide `unpkg@latest`~~ 已于第四轮 vendor 本地（pin v1.23.0，`js/lucide.min.js`）。
- [x] ~~SEO/社交基建~~ 已于第四轮补齐（见下）。
- [ ] 二级页 `hotels.html` / `restaurants.html` 待建（按约定本轮未动）。
- [ ] 社交链接为平台首页占位，非真实账号（建议补真实 handle 或去掉 sameAs 之外的占位）。
- [ ] 接 GitHub Actions CI（含 Lighthouse 门禁）、加隐私友好分析 + GDPR cookie 同意。

---

## 🚀 一级界面优化（2026-07-09 第四轮）

目标：补齐 SEO/社交基建与结构化数据、消除最后一个运行时第三方依赖（Lucide）、加固无障碍（skip-to-content + reduced-motion）。改动仅限一级单页 `index.html`、`js/lucide.min.js`、`apple-touch-icon.png`，**未动二级页**。

### 改动清单
- **Lucide 本地化（vendor）**：`unpkg.com/lucide@latest` → 下载 pin 版 `js/lucide.min.js`（v1.23.0，401KB，UMD 构建）本地引用。至此**运行时第三方请求数 = 0**（字体已于第三轮本地化）。
- **SEO / 社交 meta 全补齐**：canonical + `theme-color`(#0e4d64) + `color-scheme`(light) + Open Graph×7（og:type/title/description/url/image/site_name/locale）+ Twitter Card（summary_large_image）+ `apple-touch-icon.png`（新生成 180×180 品牌色）。社交分享（WhatsApp/FB/IG）现可出富预览。
- **JSON-LD 结构化数据**：`application/ld+json` 声明 `TravelAgency`（名称/URL/描述/图/logo/电话/服务区域/地址），利于 Google 富摘要。
- **skip-to-content 跳转**：`<body>` 顶部加视觉隐藏、聚焦即显形的 `a.skip-link[href="#main"]`；内容区用 `<main id="main" tabindex="-1">` 包裹（改善键盘/屏幕阅读器地标导航，WCAG 2.4.1）。
- **prefers-reduced-motion 守卫**：内联 `<style>` 加 `@media (prefers-reduced-motion: reduce)`，关闭 `scroll-behavior:smooth`、`.fade-in` 入场动画与 `.animate-bounce`（WCAG 2.3.3）；减弱动效用户内容立即可见、无位移。

### 复测结果（全绿）
| 测试层 | 结果 |
|--------|------|
| 静态审计 | **19 PASS / 0 FAIL / 1 WARN**（WARN=hero 故意 eager 非 lazy） |
| 功能 E2E + a11y + 视觉回归（Playwright） | **20 PASS / 0 FAIL** |
| axe-core WCAG 2.1 AA | 0 critical / 0 serious |
| Core Web Vitals | **LCP=152ms** / FCP=152ms / CLS=0.000 |
| 外部依赖校验（自研 `scripts/verify-external.mjs`） | **PASS**：零第三方运行时请求；`window.lucide` 已定义且渲染出 `<svg class="lucide">` 图标 >0；skip-link + `<main>` 地标存在；JSON-LD 解析为 TravelAgency；reduced-motion 下 `.fade-in` opacity=1（内容可见） |

### 测试工具增强（scripts/，可复现）
- `scripts/verify-external.mjs`：起本地 server + Playwright 加载，断言① 无任何第三方运行时请求（unpkg 等）② `window.lucide` 已定义且渲染出 `<svg>` 图标 ③ skip-link 与 `<main>` 地标存在 ④ JSON-LD 可解析 ⑤ 模拟 `reducedMotion:reduce` 后 `.fade-in` 仍可见——把「零依赖 + 无障碍」从人工结论变成自动卡点。
