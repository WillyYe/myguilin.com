// ==================== COMMON — GitHub 直连助手（无服务器 / 无代理 / 无 Worker） ====================
// 机制：浏览器持 GitHub PAT（存 localStorage），直接调 GitHub Contents API 读写仓库文件。
// 参考 visitzhangjiajie.com/admin 的实现，已验证可行。

// ---------- 基础工具 ----------
function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 仓库定位（可在「设置」中覆盖，存 localStorage）
var GH_REPO = localStorage.getItem('gh_repo') || 'WillyYe/myguilin.com';
var GH_BRANCH = localStorage.getItem('gh_branch') || 'main';

function getGhToken() {
  return localStorage.getItem('gh_token');
}

// 直连 GitHub Contents API：GET 读、PUT 写（带 sha）、DELETE 删
function ghFetch(path, method, body) {
  var token = getGhToken();
  if (!token) return Promise.reject(new Error('GitHub Token 未配置，请在「设置」中粘贴'));
  var url = 'https://api.github.com/repos/' + GH_REPO + '/contents/' + path;
  if (!method || method === 'GET') url += '?ref=' + GH_BRANCH;
  var opts = {
    method: method || 'GET',
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    var payload = { message: body.message, content: body.content, branch: GH_BRANCH };
    if (body.sha) payload.sha = body.sha;
    opts.body = JSON.stringify(payload);
  }
  return fetch(url, opts);
}

// UTF-8 安全 base64（配置含中文，必须用这套编解码）
function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function base64ToUtf8(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

// ---------- Hero / Subtitle 语法糖（老板写纯文本，存进去仍是 HTML） ----------
// Hero 标题：输入框用换行 \n，存盘转 <br>；显示时还原。HTML 实体也双向转换。
function heroTitleToInput(titleHtml) {
  if (!titleHtml) return '';
  return unescapeEntities(String(titleHtml)).replace(/<br\s*\/?>/gi, '\n');
}
function heroTitleToHtml(input) {
  if (!input) return '';
  return escapeHtml(String(input)).replace(/\n/g, '<br>');
}

// 副标题：*文字* 转 <em>；其余 HTML 转义，换行转 <br>。
function subtitleToInput(subtitleHtml) {
  if (!subtitleHtml) return '';
  var t = unescapeEntities(String(subtitleHtml));
  t = t.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  return t;
}
function subtitleToHtml(input) {
  if (!input) return '';
  var t = escapeHtml(String(input));
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
  t = t.replace(/\n/g, '<br>');
  return t;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function unescapeEntities(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

// ---------- 结构化校验：坏数据绝不进仓库 ----------
// 返回 { ok:boolean, errors:[string] }
function validateConfig(cfg) {
  var errors = [];
  if (!cfg || typeof cfg !== 'object') { return { ok: false, errors: ['配置不是合法对象'] }; }

  if (!cfg.hero || typeof cfg.hero !== 'object') errors.push('缺少 hero 区块');
  else {
    if (typeof cfg.hero.eyebrow !== 'string') errors.push('hero.eyebrow 必须是文字');
    if (typeof cfg.hero.titleHtml !== 'string') errors.push('hero.titleHtml 必须是文字');
    if (typeof cfg.hero.subtitle !== 'string') errors.push('hero.subtitle 必须是文字');
  }

  if (!Array.isArray(cfg.nav)) errors.push('nav 必须是数组');
  else {
    cfg.nav.forEach(function (item, i) {
      var where = 'nav[' + i + ']';
      if (!item || typeof item !== 'object') { errors.push(where + ' 不是对象'); return; }
      if (typeof item.label !== 'string' || !item.label.trim()) errors.push(where + '.label 不能为空');
      if (item.type === 'link') {
        if (typeof item.href !== 'string' || !item.href.trim()) errors.push(where + ' (link) 的链接不能为空');
      } else if (item.type === 'button') {
        if (typeof item.action !== 'string' || !item.action.trim()) errors.push(where + ' (button) 的动作不能为空');
      } else if (item.type === 'mega') {
        if (!item.mega || !Array.isArray(item.mega.sections)) errors.push(where + ' (mega) 缺少下拉内容 sections');
        else validateMegaSections(item.mega.sections, where + '.mega', errors);
      } else {
        errors.push(where + ' 的类型未知：' + item.type + '（应为 link / button / mega）');
      }
    });
  }

  if (!cfg.cta || typeof cfg.cta.href !== 'string') errors.push('缺少 cta 区块');
  return { ok: errors.length === 0, errors: errors };
}

function validateMegaSections(sections, path, errors) {
  var validTypes = ['grid-links', 'features', 'links-grid', 'footer-link', 'footer-section'];
  sections.forEach(function (sec, i) {
    var where = path + '.sections[' + i + ']';
    if (!sec || typeof sec !== 'object') { errors.push(where + ' 不是对象'); return; }
    if (validTypes.indexOf(sec.type) === -1) { errors.push(where + ' 的 section 类型未知：' + sec.type); return; }
    if (sec.type === 'grid-links') {
      if (!Array.isArray(sec.columns)) errors.push(where + ' (grid-links) 缺少 columns');
    } else if (sec.type === 'features' || sec.type === 'links-grid') {
      if (!Array.isArray(sec.items)) errors.push(where + ' (' + sec.type + ') 缺少 items');
    } else if (sec.type === 'footer-link') {
      if (typeof sec.href !== 'string') errors.push(where + ' (footer-link) 缺少 href');
    } else if (sec.type === 'footer-section') {
      if (!Array.isArray(sec.links)) errors.push(where + ' (footer-section) 缺少 links');
    }
  });
}

// ---------- Toast 与设置 ----------
function showToast(msg, type) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + (type || '') + ' show';
  setTimeout(function () { t.classList.remove('show'); }, 3000);
}

function saveGhSettings(token, repo, branch) {
  if (token) localStorage.setItem('gh_token', token);
  if (repo) { localStorage.setItem('gh_repo', repo); GH_REPO = repo; }
  if (branch) { localStorage.setItem('gh_branch', branch); GH_BRANCH = branch; }
}

function friendlyError(errMsg) {
  var msg = errMsg || '';
  if (msg.indexOf('Bad credentials') !== -1 || msg.indexOf('401') !== -1) return 'GitHub Token 无效或已失效，请在「设置」中重新粘贴';
  if (msg.indexOf('sha was supplied') !== -1 || msg.indexOf('does not match') !== -1) return '文件已被其他修改覆盖，请点「重新加载」后再保存';
  if (msg.indexOf('Not Found') !== -1 || msg.indexOf('404') !== -1) return '文件路径不存在（检查仓库/分支是否正确）';
  if (msg.indexOf('403') !== -1) return 'Token 权限不足，请确保有该仓库 Contents 读写权限';
  if (msg.indexOf('NetworkError') !== -1 || msg.indexOf('Failed to fetch') !== -1) return '网络连接失败，请检查网络';
  return msg || '未知错误，请重试';
}
