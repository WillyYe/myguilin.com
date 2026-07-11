# myguilin.com — 餐厅模块二级界面上线

## 完成内容

新增 5 个餐厅二级分类页，与酒店模块同构：

| 页面 | 内容定位 |
|------|----------|
| `food/guide.html` | 桂林美食总览：10 道招牌菜图文卡 |
| `food/featured.html` | 特色餐厅：景观/氛围/体验型餐厅 |
| `food/chinese.html` | 中餐厅：桂林菜、粤菜、农家菜 |
| `food/western.html` | 西餐与国际：印度、披萨、咖啡馆 |
| `food/must-eat.html` | 必吃榜：3 天短清单 |

- 收录 19 家真实、受国际游客好评的阳朔/桂林餐厅（Ganga Impression、Lucy's Cafe、Cloud 9、Amy's on the Li、刘姐/大师傅/谢姐啤酒鱼等）。
- 生成 15 张美食图片（5 张分类 hero + 10 张菜品图），全部转 webp 入 `images/`。
- 首页 `#food` 区块改为 5 张分类入口卡；导航 Food 升级为 mega-menu 下拉；移动端菜单同步增加子项。
- 扩展 `scripts/build-attractions.mjs`：餐厅卡片、菜品卡片、分类页渲染、导航、sitemap、llms.txt。
- 扩展 `tests/browser-test.mjs`：food/*.html E2E 循环。

## 测试结果

- `npm run test:static`：19 pass / 0 fail / 1 warn（warn = hero 不懒加载，保 LCP）
- `npm run test:e2e`：532 pass / 0 fail

## 待处理

- GitHub 推送失败（443 连不上 / timeout）。本地 commit `5531f08` 已就绪，需网络恢复后 `git push origin main`。
- 生成图片右下角带「图片由AI生成」水印，若后续需要无水印，可用 X 推广配图时的「底部留白 + 裁剪」策略统一处理。
