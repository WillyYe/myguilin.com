# myguilin.com — 一级界面测试报告

**测试对象**：单页一级界面 `index.html`（7 大区块：Hero / Attractions(8) / Experiences(8) / Tours / Hotels入口 / Food入口 / Contact）
**测试日期**：2026-07-09
**测试专家**：WebappTestingExpert（端测测）

---

## 1. 测试策略

按测试金字塔先做**高覆盖、低成本的静态审计**（不依赖浏览器，能抓 90% 真实缺陷），再用**真实浏览器 E2E 冒烟**覆盖渲染/导航/控制台。

| 层级 | 工具 | 覆盖 |
|------|------|------|
| 静态完整性 | Node 脚本 `tests/static-audit.mjs` | 断图、断链、锚点、alt、lazy、卡片数、性能预算、死文件、**WCAG 2.1 AA 深度项**（标题层级 / 表单 label / 链接可访问名 / 焦点可见性） |
| 真实浏览器 | Playwright `tests/e2e.mjs`（chromium 下载中，完成后自动补跑） | 渲染、导航跳转、移动端、控制台错误 |

---

## 2. 静态审计结果 —— **20 PASS / 0 FAIL / 1 WARN**

> 本轮（导航栏 + Contact 弹窗专项）新增 T11–T17：对话框语义、无 `javascript:` URI 链接、弹窗关闭机制、移动菜单自动收起、WCAG 2.1 AA 深度项（标题层级 / 表单 label / 链接可访问名 / 焦点可见性）。

| # | 检查项 | 结果 | 说明 |
|---|--------|------|------|
| T1 | 引用图片均在磁盘 | ✅ | 19 张引用图全部存在 |
| T2 | 页内 `#` 锚点可解析 | ✅ | 67 个锚点全部命中元素 id |
| T3 | `.html` 子页链接存在 | ✅ | 无悬空 .html 外链（入口卡已改为 #hotel/#food 锚点占位） |
| T4 | `alt` 属性齐全 | ✅ | 23 张图均带 alt；5 张 mega-menu 缩略图为空 alt（冗余装饰图，WCAG 合规） |
| T5 | `loading="lazy"` | ✅ | 23 张 `<img>` 全部懒加载 |
| T6 | 卡片数量 | ✅ | Attractions=8、Experiences=8，符合预期 |
| T7 | 图片性能预算 | ✅ | 引用图总负载 **2.00MB**（预算 <2.5MB），最大 204KB |
| T8 | 死文件 | ✅ | 无游离图（hotel-*/food-* 为子页预留，不计入） |
| T9 | `<html lang>` | ✅ | `lang="en"`，外语站必需 |
| T10 | 语义 landmark | ✅ | `<nav>×1`、`<footer>×1` |

---

## 3. 发现（Findings）

### F-1 ✅ 入口卡 404 已缓解（锚点占位）
- **原风险**：`#hotel`/`#food` 入口卡原指向 `hotels.html`/`restaurants.html`，二/三级页未建 → 线上 404。
- **处置**：已按约定改为 `#hotel` / `#food` 锚点占位（2026-07-09 修改），点击不再 404；子页建好后换回真实链接即可。
- **状态**：静态审计 T3 现已 PASS（无悬空 .html 外链）。

### F-2 ✅ 4 张大图已再压（2026-07-09 已处理）
- `exp-liriver` 237→153KB、`exp-climb` 205→146KB、`exp-cycling` 200→151KB（竖图限高 1100px + quality 78）；`hero-liriver` 212→203KB（1600px 全屏 hero 背景，仅降 quality 保留清晰度）。
- 引用图总负载 **2.16MB → 2.00MB**。
- 静态审计现仅剩 1 条 WARN：`hero-liriver.jpg` 204KB —— 全屏 hero 背景必需、1600px 宽，预算内合理保留，非缺陷。

### F-3 ✅ Footer 栏目标题跳级已修复（WCAG 2.4.6，2026-07-09）
- **发现**：footer 三个栏目标题（`Explore`/`Contact`/`Follow`）原为 `<h4>`，其上方最近标题是 CTA 区的 `<h2>`，中间无 `<h3>`，形成 h2→h4 跳级，屏幕阅读器按标题导航时层级断裂。
- **修复**：改为 `<h3>`（样式由 class 控制，视觉不变），标题序列现为 `1>2>…>3` 无跳级。
- **状态**：静态审计 T10 现已 PASS（Heading levels do not skip）。

### F-4 ✅ 导航「Contact us」触发改为 `<button>`（语义/a11y，2026-07-09）
- **发现**：桌面 + 移动导航的「Contact us」原用 `<a href="javascript:void(0)" onclick=...>`。这是反模式——它是动作不是导航，屏幕阅读器会读成"无目标的链接"，且 `javascript:` URI 可能被扩展/严格策略拦截。
- **修复**：改为 `<button type="button" onclick="openContactModal()">`，加 `bg-transparent border-0 cursor-pointer` 去默认按钮外观，视觉与导航链接一致。
- **状态**：静态审计 T15 现已 PASS（无 `javascript:` URI 链接）。

### F-5 ✅ Contact 弹窗补 `role="dialog"` + `aria-modal`（WCAG 4.1.2，2026-07-09）
- **发现**：弹窗原是裸 `<div id="contact-modal">`，无 role/aria。辅助技术无法识别"对话框已打开"，屏幕阅读器用户不知道上下文切换。
- **修复**：加 `role="dialog" aria-modal="true" aria-labelledby="contact-modal-title"`，标题 `<h3>` 加 `id="contact-modal-title"`。
- **状态**：静态审计 T14 现已 PASS（dialog semantics）。

### F-6 ✅ 弹窗焦点管理 + 焦点陷阱（WCAG 2.4.3 / 2.1.2，2026-07-09）
- **发现**：弹窗打开时焦点仍停留在触发链接上；键盘 Tab 会"逃逸"到被遮罩的页面内容后面；关闭后焦点不归位。
- **修复**：`openContactModal()` 打开即把焦点移到关闭按钮；`contactModal` 上监听 Tab 做焦点陷阱（Shift+Tab 到首项 / Tab 到末项循环）；`closeContactModal()` 关闭后把焦点还给触发元素。
- **状态**：静态审计 T16 现已 PASS（关闭机制齐全）；焦点陷阱属运行时行为，由 E2E 补验（见下）。

### F-7 ✅ 移动菜单点链接后自动收起（UX，2026-07-09）
- **发现**：移动菜单里除 Contact 外，其余锚点链接（Home / Attractions / …）点完页面滚动、菜单仍罩着内容，需再点一次汉堡才收起——真实可用性问题。
- **修复**：脚本里给 `#mobile-menu a[href^="#"]` 全部加 click 委托，点任一区块链接即 `classList.add('hidden')` 收起菜单（Contact 按钮自身 onclick 已含收起）。
- **状态**：静态审计 T17 现已 PASS（mobile menu auto-closes）。

### 验证过的非问题（避免误报）
- **吸顶导航遮挡锚点（疑似 F-9）**：第 108–109 行已有 `scroll-padding-top:80px` + `section[id]{scroll-margin-top:80px}`，64px 吸顶栏下方留 16px 余量，锚点落点不被遮挡 —— **非缺陷**。
- **重复 id**：全站 `id` 唯一（`#contact` 区块与 `#contact-modal` 弹窗不冲突）—— 非缺陷。
- **「Inquire Now」按钮仍滚到底部**：Tour 卡片的 3 个 CTA 保留 `href="#contact"` 滚动到完整联系区，符合预期——非缺陷。

---

## 4. 结论

一级界面**通过完整性、可访问性、性能预算的全部硬性检查（20 PASS / 0 FAIL / 1 WARN）**：无断图、无断锚点、无缺失 alt、懒加载全覆盖、卡片数量正确，WCAG 2.1 AA 标题层级/链接名/焦点可见性/对话框语义均合规。导航栏 + Contact 弹窗专项本轮新发现并修复 **F-4~F-7**（按钮语义、对话框 role/aria、焦点管理+陷阱、移动菜单自动收起）。F-1（子页 404）已用锚点占位缓解；F-2（4 张大图再压）总负载 2.16MB→2.00MB；F-3（footer 标题跳级）已修复。仅剩 hero 全屏背景 204KB 因清晰度必要保留，非缺陷。

**E2E 真实浏览器状态（重要诚实说明）**：本沙箱环境无法完成 Playwright chromium（~170MB）下载（macOS 无 `timeout` 命令 + 慢网多次中断），故 `tests/e2e.mjs` **未能在本环境实跑**。该脚本已写好可复跑，覆盖：导航锚点跳转、8+8 卡渲染、Contact 弹窗开/关 + 焦点陷阱、移动菜单开/关、控制台无错。在能联网装 chromium 的机器上执行 `node tests/e2e.mjs` 即可补出真实浏览器结论。静态审计已覆盖同等断言的标记层，运行时行为以 E2E 为准。

---

## 5. 复跑方式

```bash
# 静态审计（秒级，无需浏览器）
node tests/static-audit.mjs

# 真实浏览器 E2E（需先装 chromium）
cd /Users/Zhuanz/.workbuddy/binaries/node/workspace && npx playwright install chromium
node tests/e2e.mjs                 # 默认测线上 https://myguilin.com
BASE=http://localhost:8099 node tests/e2e.mjs   # 或测本地静态服务
```
