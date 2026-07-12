// ==================== SHELL-ADMIN — Site Shell 编辑器（导航 + 首页 Hero） ====================
// 模块一：编辑 site-config.json 的 hero（结构化字段）与 nav（JSON 文本框）。
// 保存前对 nav 做 JSON.parse 校验，绝不让坏数据进仓库搞崩构建。

var CONFIG_PATH = 'site-config.json';
var currentConfig = null;
var currentSha = null;

// 页面加载：若已存 Token，直接拉取配置
document.addEventListener('DOMContentLoaded', function () {
  // 回填设置表单
  var tk = document.getElementById('ghToken');
  var rp = document.getElementById('ghRepo');
  var br = document.getElementById('ghBranch');
  if (tk && localStorage.getItem('gh_token')) tk.value = localStorage.getItem('gh_token');
  if (rp && localStorage.getItem('gh_repo')) rp.value = localStorage.getItem('gh_repo');
  if (br && localStorage.getItem('gh_branch')) br.value = localStorage.getItem('gh_branch');

  document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);
  document.getElementById('btnLoad').addEventListener('click', loadConfig);
  document.getElementById('btnSave').addEventListener('click', saveConfig);
  document.getElementById('btnOpenSettings').addEventListener('click', function () {
    document.getElementById('settingsPanel').style.display = 'block';
  });

  if (getGhToken()) loadConfig();
});

function saveSettings() {
  var token = document.getElementById('ghToken').value.trim();
  var repo = document.getElementById('ghRepo').value.trim() || 'WillyYe/myguilin.com';
  var branch = document.getElementById('ghBranch').value.trim() || 'main';
  if (!token) { showToast('请粘贴 GitHub Token', ''); return; }
  saveGhSettings(token, repo, branch);
  showToast('设置已保存 ✅', 'success');
  document.getElementById('settingsPanel').style.display = 'none';
  loadConfig();
}

function loadConfig() {
  var token = getGhToken();
  if (!token) { showToast('请先在「设置」中粘贴 GitHub Token', ''); document.getElementById('settingsPanel').style.display = 'block'; return; }
  showToast('正在加载配置…', '');
  ghFetch(CONFIG_PATH, 'GET')
    .then(function (r) { if (!r.ok) throw new Error('读取失败 HTTP ' + r.status); return r.json(); })
    .then(function (file) {
      currentSha = file.sha;
      currentConfig = JSON.parse(base64ToUtf8(file.content));
      renderEditor();
      showToast('配置已加载 ✅', 'success');
    })
    .catch(function (err) { showToast('加载失败：' + friendlyError(err.message || err), 'error'); });
}

function renderEditor() {
  if (!currentConfig || !currentConfig.hero) { showToast('配置缺少 hero 字段', 'error'); return; }
  document.getElementById('heroEyebrow').value = currentConfig.hero.eyebrow || '';
  document.getElementById('heroTitle').value = currentConfig.hero.titleHtml || '';
  document.getElementById('heroSubtitle').value = currentConfig.hero.subtitle || '';
  document.getElementById('navJson').value = JSON.stringify(currentConfig.nav || [], null, 2);
  document.getElementById('editorPanel').style.display = 'block';
}

function saveConfig() {
  if (!currentConfig) { showToast('请先加载配置', ''); return; }

  // 校验导航 JSON（最关键的防护：坏 JSON 不进仓库）
  var navText = document.getElementById('navJson').value.trim();
  var nav;
  try { nav = JSON.parse(navText); }
  catch (e) { showToast('❌ 导航 JSON 语法错误：' + e.message, 'error'); return; }
  if (!Array.isArray(nav)) { showToast('❌ 导航必须是 JSON 数组（[]）', 'error'); return; }

  // 合并：只改 hero 文本字段与 nav，保留 hero.image 等其他结构
  currentConfig.hero.eyebrow = document.getElementById('heroEyebrow').value;
  currentConfig.hero.titleHtml = document.getElementById('heroTitle').value;
  currentConfig.hero.subtitle = document.getElementById('heroSubtitle').value;
  currentConfig.nav = nav;

  var content = utf8ToBase64(JSON.stringify(currentConfig, null, 2));
  showToast('正在保存…', '');
  ghFetch(CONFIG_PATH, 'PUT', { message: 'Update site shell via admin', content: content, sha: currentSha })
    .then(function (r) { if (!r.ok) return r.json().then(function (d) { throw new Error(d.message || ('HTTP ' + r.status)); }); return r.json(); })
    .then(function (d) {
      currentSha = d.content.sha;
      showToast('✅ 已保存，站点将在 1–2 分钟内自动重建更新', 'success');
    })
    .catch(function (err) { showToast('保存失败：' + friendlyError(err.message || err), 'error'); });
}
