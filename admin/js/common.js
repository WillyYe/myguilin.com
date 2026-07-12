// ==================== COMMON — GitHub 直连助手（无服务器 / 无代理 / 无 Worker） ====================
// 机制：浏览器持 GitHub PAT（存 localStorage），直接调 GitHub Contents API 读写仓库文件。
// 参考 visitzhangjiajie.com/admin 的实现，已验证可行。

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

function showToast(msg, type) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + (type || '') + ' show';
  setTimeout(function () { t.classList.remove('show'); }, 2800);
}

// 持久化 GitHub 设置
function saveGhSettings(token, repo, branch) {
  if (token) localStorage.setItem('gh_token', token);
  if (repo) { localStorage.setItem('gh_repo', repo); GH_REPO = repo; }
  if (branch) { localStorage.setItem('gh_branch', branch); GH_BRANCH = branch; }
}

// 友好错误
function friendlyError(errMsg) {
  var msg = errMsg || '';
  if (msg.indexOf('Bad credentials') !== -1 || msg.indexOf('401') !== -1) return 'GitHub Token 无效或已失效，请在「设置」中重新粘贴';
  if (msg.indexOf('sha was supplied') !== -1 || msg.indexOf('does not match') !== -1) return '文件已被其他修改覆盖，请点「重新加载」后再保存';
  if (msg.indexOf('Not Found') !== -1 || msg.indexOf('404') !== -1) return '文件路径不存在（检查仓库/分支是否正确）';
  if (msg.indexOf('403') !== -1) return 'Token 权限不足，请确保有该仓库 Contents 读写权限';
  if (msg.indexOf('NetworkError') !== -1 || msg.indexOf('Failed to fetch') !== -1) return '网络连接失败，请检查网络';
  return msg || '未知错误，请重试';
}
