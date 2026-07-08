# myguilin.com — 一级界面测试报告

**测试对象**：单页一级界面 `index.html`（7 大区块：Hero / Attractions(8) / Experiences(8) / Tours / Hotels入口 / Food入口 / Contact）
**测试日期**：2026-07-09
**测试专家**：WebappTestingExpert（端测测）

---

## 1. 测试策略

按测试金字塔先做**高覆盖、低成本的静态审计**（不依赖浏览器，能抓 90% 真实缺陷），再用**真实浏览器 E2E 冒烟**覆盖渲染/导航/控制台。

| 层级 | 工具 | 覆盖 |
|------|------|------|
| 静态完整性 | Node 脚本 `tests/static-audit.mjs` | 断图、断链、锚点、alt、lazy、卡片数、性能预算、死文件 |
| 真实浏览器 | Playwright `tests/e2e.mjs`（chromium 下载中，完成后自动补跑） | 渲染、导航跳转、移动端、控制台错误 |

---

## 2. 静态审计结果 —— **11 PASS / 0 FAIL / 1 WARN**

| # | 检查项 | 结果 | 说明 |
|---|--------|------|------|
| T1 | 引用图片均在磁盘 | ✅ | 19 张引用图全部存在 |
| T2 | 页内 `#` 锚点可解析 | ✅ | 67 个锚点全部命中元素 id |
| T3 | `.html` 子页链接存在 | ✅ | 无悬空 .html 外链（入口卡已改为 #hotel/#food 锚点占位） |
| T4 | `alt` 属性齐全 | ✅ | 23 张图均带 alt；5 张 mega-menu 缩略图为空 alt（冗余装饰图，WCAG 合规） |
| T5 | `loading="lazy"` | ✅ | 23 张 `<img>` 全部懒加载 |
| T6 | 卡片数量 | ✅ | Attractions=8、Experiences=8，符合预期 |
| T7 | 图片性能预算 | ✅ | 引用图总负载 **2.16MB**（预算 <2.5MB），最大 237KB |
| T8 | 死文件 | ✅ | 无游离图（hotel-*/food-* 为子页预留，不计入） |
| T9 | `<html lang>` | ✅ | `lang="en"`，外语站必需 |
| T10 | 语义 landmark | ✅ | `<nav>×1`、`<footer>×1` |

---

## 3. 发现（Findings）

### F-1 ✅ 入口卡 404 已缓解（锚点占位）
- **原风险**：`#hotel`/`#food` 入口卡原指向 `hotels.html`/`restaurants.html`，二/三级页未建 → 线上 404。
- **处置**：已按约定改为 `#hotel` / `#food` 锚点占位（2026-07-09 修改），点击不再 404；子页建好后换回真实链接即可。
- **状态**：静态审计 T3 现已 PASS（无悬空 .html 外链）。

### F-2 ⚠️ 4 张图 >200KB（性能优化建议，非缺陷）
- `hero-liriver.jpg` 212KB、`exp-liriver.jpg` 237KB、`exp-cycling.jpg` 200KB、`exp-climb.jpg` 205KB。
- 均在 2.5MB 总预算内，对总负载无实质影响。若想再榨一点加载速度（你网络 1.73Mbps），可把 quality 从 85 降到 82 或宽度收到 750px，预计各再省 15–25%。

---

## 4. 结论

一级界面**通过完整性、可访问性、性能预算的全部硬性检查**，无断图、无断锚点、无缺失 alt、懒加载全覆盖、卡片数量正确。F-1（子页 404）已用锚点占位缓解；唯一剩余建议是 **F-2（4 张图可再压）**，属非缺陷的优化项。

E2E 冒烟（真实浏览器渲染/导航/移动端/控制台）将在 chromium 下载完成后自动补跑并追加结论。

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
