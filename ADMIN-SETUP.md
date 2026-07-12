# MyGuilin 后台设置指南（无需代理 / 无需 Cloudflare Worker）

后台地址：`https://myguilin.com/admin/`

本后台是**纯静态**管理界面（仿 visitzhangjiajie.com/admin 的做法）：
- 浏览器直接持 GitHub 个人访问令牌（PAT）调用 GitHub API 读写仓库文件
- **不需要** OAuth App、**不需要** 代理服务器、**不需要** Cloudflare Worker
- 保存 = 提交文件到仓库 → GitHub Actions 自动重建站点（约 1–2 分钟生效）

---

## 第一步：生成 GitHub Token（一次性）

1. 打开 https://github.com/settings/tokens
2. 推荐用 **Fine-grained token**（更细粒度、更安全）：
   - Resource owner：`WillyYe`
   - Repository access：仅选 `myguilin.com`
   - Permissions → Contents：**Read and write**
3. 或用 **Classic token**，勾选 `repo`（完整仓库权限）
4. 生成后**复制令牌**（只显示一次）

> 安全说明：令牌只存在你当前浏览器的 `localStorage`，**不会上传到任何服务器**。
> 用完可在 GitHub 随时撤销；若换浏览器需重新粘贴。

## 第二步：连接后台

1. 打开 https://myguilin.com/admin/
2. 点右上角 **⚙ 设置**
3. 填入：
   - **GitHub Token**：粘贴第一步的令牌
   - **仓库**：`WillyYe/myguilin.com`
   - **分支**：`main`
4. 点 **保存设置** → 后台会自动加载当前配置

## 第三步：编辑并保存

- **首页 Hero**：eyebrow / 标题 / 副标题 直接填（标题可用 `<br>` 换行）
- **导航 Nav**：以 JSON 编辑（复杂 mega 菜单建议先复制现有内容小改）
- 点 **💾 保存并部署** → 约 1–2 分钟后站点更新

---

## 文件结构（本后台相关）

| 文件 | 作用 |
|---|---|
| `admin/index.html` | 后台界面（设置 + Hero 表单 + Nav JSON 编辑） |
| `admin/js/common.js` | GitHub 直连助手（ghFetch / base64 / toast） |
| `admin/js/shell-admin.js` | Site Shell 编辑器逻辑（加载/保存 site-config.json） |
| `site-config.json` | 导航 + 首页 Hero 的数据源（后台编辑的就是它） |
| `scripts/build-shell.mjs` | 读取 site-config.json 重建 index.html 的导航与 Hero |
| `.github/workflows/deploy.yml` | 监听 site-config.json 变动，自动重建并部署 |

## 后续模块

按"一个一个模块来"的节奏，后续可把 `attractions` / `guides` / `hotels` / `food` 的数据
（目前是 `*-data.mjs`）也转成 JSON，并复制本后台的编辑模式逐个接入。
