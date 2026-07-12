// ==================== SHELL-ADMIN — 老板友好的 Site Shell 编辑器 ====================
// 模块：首页 Hero + 导航菜单（含 mega 下拉）。全部可视化编辑，绝不暴露 JSON。
// 保存前做结构化校验，坏数据绝不进仓库。

var CONFIG_PATH = 'site-config.json';
var currentConfig = null;
var currentSha = null;
var currentModule = 'hero';

// ---------- 小工具：创建 DOM ----------
function el(tag, opts) {
  var n = document.createElement(tag);
  if (opts) {
    for (var k in opts) {
      if (k === 'class') n.className = opts[k];
      else if (k === 'text') n.textContent = opts[k];
      else if (k === 'html') n.innerHTML = opts[k];
      else if (k === 'dataset') { for (var d in opts.dataset) n.dataset[d] = opts.dataset[d]; }
      else if (k.slice(0, 2) === 'on' && typeof opts[k] === 'function') n.addEventListener(k.slice(2), opts[k]);
      else n.setAttribute(k, opts[k]);
    }
  }
  return n;
}
function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

// ---------- 状态条 ----------
function setStatus(state, text) {
  var box = document.getElementById('publishStatus');
  var tx = document.getElementById('publishStatusText');
  box.className = state || '';
  tx.textContent = text || '就绪';
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function () {
  // 回填设置表单
  if (localStorage.getItem('gh_token')) document.getElementById('ghToken').value = localStorage.getItem('gh_token');
  if (localStorage.getItem('gh_repo')) document.getElementById('ghRepo').value = localStorage.getItem('gh_repo');
  if (localStorage.getItem('gh_branch')) document.getElementById('ghBranch').value = localStorage.getItem('gh_branch');

  // Hero 表单实时同步 + 预览
  ['heroEyebrow', 'heroTitle', 'heroSubtitle'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () { syncHeroFromForm(); updateHeroPreview(); });
  });
  document.getElementById('btnSaveHero').addEventListener('click', saveConfig);
  document.getElementById('btnReloadHero').addEventListener('click', loadConfig);

  // Nav
  document.getElementById('btnAddNav').addEventListener('click', addNavItem);
  document.getElementById('btnSaveNav').addEventListener('click', saveConfig);
  document.getElementById('btnReloadNav').addEventListener('click', loadConfig);

  // 模块切换
  document.querySelectorAll('.mod[data-module]').forEach(function (b) {
    b.addEventListener('click', function () { switchModule(b.dataset.module); });
  });

  // 设置弹层
  var modal = document.getElementById('settingsModal');
  document.getElementById('btnOpenSettings').addEventListener('click', function () { modal.classList.add('show'); });
  document.getElementById('btnSettings2').addEventListener('click', function () { modal.classList.add('show'); });
  document.getElementById('btnCloseSettings').addEventListener('click', function () { modal.classList.remove('show'); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('show'); });
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);

  // 拖拽（事件委托）
  setupDragAndDrop();

  if (getGhToken()) loadConfig();
  else { showToast('请先在「设置」中粘贴 GitHub Token', ''); modal.classList.add('show'); }
});

// ==================== 模块切换 ====================
function switchModule(name) {
  currentModule = name;
  document.querySelectorAll('.mod[data-module]').forEach(function (b) {
    b.classList.toggle('active', b.dataset.module === name);
  });
  document.querySelectorAll('.panel').forEach(function (p) {
    p.classList.toggle('active', p.dataset.panel === name);
  });
  document.querySelectorAll('#previewPane [data-preview]').forEach(function (p) {
    p.style.display = (p.dataset.preview === name) ? '' : 'none';
  });
}

// ==================== 加载配置 ====================
function loadConfig() {
  var token = getGhToken();
  if (!token) { showToast('请先在「设置」中粘贴 GitHub Token', ''); document.getElementById('settingsModal').classList.add('show'); return; }
  setStatus('', '加载中…');
  showToast('正在加载配置…', '');
  ghFetch(CONFIG_PATH, 'GET')
    .then(function (r) { if (!r.ok) throw new Error('读取失败 HTTP ' + r.status); return r.json(); })
    .then(function (file) {
      currentSha = file.sha;
      currentConfig = JSON.parse(base64ToUtf8(file.content));
      renderAll();
      setStatus('', '就绪');
      showToast('配置已加载 ✅', 'success');
    })
    .catch(function (err) { setStatus('err', '加载失败'); showToast('加载失败：' + friendlyError(err.message || err), 'error'); });
}

function renderAll() {
  renderHeroForm();
  updateHeroPreview();
  renderNavList();
  updateNavPreview();
}

// ==================== Hero ====================
function renderHeroForm() {
  if (!currentConfig || !currentConfig.hero) { showToast('配置缺少 hero 字段', 'error'); return; }
  var h = currentConfig.hero;
  document.getElementById('heroEyebrow').value = h.eyebrow || '';
  document.getElementById('heroTitle').value = heroTitleToInput(h.titleHtml);
  document.getElementById('heroSubtitle').value = subtitleToInput(h.subtitle);
}
function syncHeroFromForm() {
  if (!currentConfig || !currentConfig.hero) return;
  currentConfig.hero.eyebrow = document.getElementById('heroEyebrow').value;
  currentConfig.hero.titleHtml = heroTitleToHtml(document.getElementById('heroTitle').value);
  currentConfig.hero.subtitle = subtitleToHtml(document.getElementById('heroSubtitle').value);
}
function updateHeroPreview() {
  var box = document.getElementById('heroPreview');
  if (!box || !currentConfig || !currentConfig.hero) return;
  var h = currentConfig.hero;
  clear(box);
  var eyebrow = el('div', { class: 'eyebrow', text: h.eyebrow || '' });
  var title = el('div', { class: 'title', html: h.titleHtml || '' });
  var sub = el('div', { class: 'sub', html: h.subtitle || '' });
  box.appendChild(eyebrow); box.appendChild(title); box.appendChild(sub);
}

// ==================== Nav 顶层编辑器 ====================
function renderNavList() {
  var list = document.getElementById('navList');
  clear(list);
  if (!currentConfig || !Array.isArray(currentConfig.nav)) return;
  currentConfig.nav.forEach(function (item, idx) {
    list.appendChild(renderNavItem(item, idx));
  });
}

function renderNavItem(item, idx) {
  var card = el('div', { class: 'nav-item', dataset: { drag: 'nav', idx: idx }, 'data-testid': 'nav-item-' + idx });
  card.setAttribute('draggable', 'true');

  // head
  var head = el('div', { class: 'nav-head' });
  var drag = el('span', { class: 'drag', text: '⠿', title: '拖动排序' });
  var labelIn = el('input', { type: 'text', class: 'label-in', value: item.label || '', placeholder: '菜单显示文字', 'data-testid': 'nav-label-' + idx });
  labelIn.addEventListener('input', function (e) { item.label = e.target.value; updateNavPreview(); });
  var typeSel = el('select', { 'data-testid': 'nav-type-' + idx });
  [['link', '普通链接'], ['mega', '带下拉大菜单'], ['button', '按钮']].forEach(function (o) {
    var op = el('option', { value: o[0], text: o[1] });
    if (item.type === o[0]) op.selected = true;
    typeSel.appendChild(op);
  });
  typeSel.addEventListener('change', function (e) { changeNavType(item, e.target.value); renderNavItemBody(item, idx, card.querySelector('.nav-body')); updateNavPreview(); });

  var up = el('button', { class: 'toggle', text: '↑', title: '上移' });
  up.addEventListener('click', function () { moveNav(idx, -1); });
  var down = el('button', { class: 'toggle', text: '↓', title: '下移' });
  down.addEventListener('click', function () { moveNav(idx, 1); });
  var del = el('button', { class: 'del', text: '✕', title: '删除' });
  del.addEventListener('click', function () { currentConfig.nav.splice(idx, 1); renderNavList(); updateNavPreview(); });

  head.appendChild(drag); head.appendChild(labelIn); head.appendChild(typeSel); head.appendChild(up); head.appendChild(down); head.appendChild(del);
  card.appendChild(head);

  // body
  var body = el('div', { class: 'nav-body' });
  card.appendChild(body);
  renderNavItemBody(item, idx, body);
  return card;
}

function renderNavItemBody(item, idx, body) {
  clear(body);
  if (item.type === 'link') {
    body.appendChild(field('链接地址 (href)', el('input', { type: 'text', value: item.href || '', placeholder: '#home 或 attractions/x.html', oninput: function (e) { item.href = e.target.value; updateNavPreview(); } })));
  } else if (item.type === 'button') {
    body.appendChild(field('按钮文字已在上方可改', el('div', { class: 'hint', text: '点击后执行网站内置动作（如打开联系窗口），一般不用改。' })));
    body.appendChild(field('动作 (action)', el('input', { type: 'text', value: item.action || '', placeholder: 'openContactModal()', oninput: function (e) { item.action = e.target.value; } })));
  } else if (item.type === 'mega') {
    if (!item.mega) item.mega = { width: 700, sections: [] };
    var w = el('div', { class: 'grid2' });
    w.appendChild(field('下拉面板宽度(px)', el('input', { type: 'text', value: String(item.mega.width || 700), oninput: function (e) { item.mega.width = parseInt(e.target.value, 10) || 700; } })));
    body.appendChild(w);
    body.appendChild(el('div', { class: 'hint', text: '下拉内容（大菜单里的分栏与链接）：' }));
    var secBox = el('div', { 'data-testid': 'mega-sections-' + idx });
    secBox.setAttribute('data-secbox', String(idx));
    body.appendChild(secBox);
    renderMegaSections(item, idx, secBox);
    var addBtn = el('button', { class: 'btn btn-ghost btn-sm', text: '＋ 添加分栏/区块', 'data-testid': 'add-section-' + idx });
    addBtn.addEventListener('click', function () {
      item.mega.sections.push({ type: 'footer-link', label: '查看全部 →', href: '#' });
      renderMegaSections(item, idx, secBox);
    });
    body.appendChild(addBtn);
  }
}

function changeNavType(item, type) {
  item.type = type;
  if (type === 'link' && typeof item.href !== 'string') item.href = '#';
  if (type === 'button' && typeof item.action !== 'string') item.action = 'openContactModal()';
  if (type === 'mega' && !item.mega) item.mega = { width: 700, sections: [{ type: 'footer-link', label: '查看全部 →', href: '#' }] };
}

function moveNav(idx, dir) {
  var arr = currentConfig.nav;
  var j = idx + dir;
  if (j < 0 || j >= arr.length) return;
  var t = arr[idx]; arr[idx] = arr[j]; arr[j] = t;
  renderNavList(); updateNavPreview();
}

function addNavItem() {
  if (!currentConfig.nav) currentConfig.nav = [];
  currentConfig.nav.push({ type: 'link', label: '新菜单', href: '#' });
  renderNavList(); updateNavPreview();
}

// ==================== Mega 下拉编辑器 ====================
function renderMegaSections(item, navIdx, container) {
  clear(container);
  (item.mega.sections || []).forEach(function (sec, sidx) {
    container.appendChild(renderSection(sec, sidx, navIdx, item));
  });
}

function renderSection(sec, sidx, navIdx, navItem) {
  var box = el('div', { class: 'mega-sec', dataset: { drag: 'section', navIdx: navIdx, secIdx: sidx }, 'data-testid': 'section-' + navIdx + '-' + sidx });
  box.setAttribute('draggable', 'true');

  var head = el('div', { class: 'sec-head' });
  var drag = el('span', { class: 'drag', text: '⠿' });
  var typeSel = el('select', {});
  [['grid-links', '分栏文字链接'], ['features', '图片网格'], ['links-grid', '文字网格'], ['footer-link', '单行链接'], ['footer-section', '底部分栏']].forEach(function (o) {
    var op = el('option', { value: o[0], text: o[1] });
    if (sec.type === o[0]) op.selected = true;
    typeSel.appendChild(op);
  });
  typeSel.addEventListener('change', function (e) {
    changeSectionType(sec, e.target.value);
    renderSectionBody(sec, box.querySelector('.sec-body'), navItem, navIdx);
  });
  var up = el('button', { class: 'toggle btn-sm', text: '↑' }); up.addEventListener('click', function () { moveSectionSafe(navItem, sidx, -1, box.parentNode); });
  var down = el('button', { class: 'toggle btn-sm', text: '↓' }); down.addEventListener('click', function () { moveSectionSafe(navItem, sidx, 1, box.parentNode); });
  var del = el('button', { class: 'del btn-sm', text: '✕' }); del.addEventListener('click', function () { navItem.mega.sections.splice(sidx, 1); renderMegaSections(navItem, navIdx, box.parentNode); });
  head.appendChild(drag); head.appendChild(typeSel); head.appendChild(up); head.appendChild(down); head.appendChild(del);
  box.appendChild(head);

  var bodyWrap = el('div', { class: 'sec-body' });
  box.appendChild(bodyWrap);
  renderSectionBody(sec, bodyWrap, navItem, navIdx);
  return box;
}

function renderSectionBody(sec, bodyWrap, navItem, navIdx) {
  clear(bodyWrap);
  if (sec.type === 'grid-links') {
    if (!sec.columns) sec.columns = [];
    sec.columns.forEach(function (col, cidx) { bodyWrap.appendChild(renderColumn(col, cidx, sec, navItem, navIdx)); });
    var addCol = el('button', { class: 'addlink', text: '＋ 添加分栏' });
    addCol.addEventListener('click', function () { sec.columns.push({ links: [{ label: '新链接', href: '#' }] }); renderMegaSections(navItem, navIdx, bodyWrap.parentNode.parentNode); });
    bodyWrap.appendChild(addCol);
  } else if (sec.type === 'features' || sec.type === 'links-grid') {
    bodyWrap.appendChild(field('列数 (cols)', el('input', { type: 'text', value: String(sec.cols || 4), oninput: function (e) { sec.cols = parseInt(e.target.value, 10) || 4; } })));
    if (sec.type === 'links-grid') bodyWrap.appendChild(field('居中显示', el('input', { type: 'checkbox', checked: !!sec.center, onchange: function (e) { sec.center = e.target.checked; } })));
    if (!sec.items) sec.items = [];
    sec.items.forEach(function (it, iidx) {
      var row = el('div', { class: 'link-row' });
      if (sec.type === 'features') {
        row.appendChild(el('input', { class: 'li', type: 'text', value: it.img || '', placeholder: '图片 webp 路径', oninput: function (e) { it.img = e.target.value; } }));
        row.appendChild(el('input', { class: 'li', type: 'text', value: it.alt || '', placeholder: '图片说明', oninput: function (e) { it.alt = e.target.value; } }));
      }
      row.appendChild(el('input', { class: 'li', type: 'text', value: it.label || '', placeholder: '显示文字', oninput: function (e) { it.label = e.target.value; } }));
      row.appendChild(el('input', { class: 'lh', type: 'text', value: it.href || '', placeholder: '链接', oninput: function (e) { it.href = e.target.value; } }));
      var x = el('button', { class: 'x', text: '✕' }); x.addEventListener('click', function () { sec.items.splice(iidx, 1); renderMegaSections(navItem, navIdx, bodyWrap.parentNode.parentNode); });
      row.appendChild(x);
      bodyWrap.appendChild(row);
    });
    var addIt = el('button', { class: 'addlink', text: '＋ 添加一项' });
    addIt.addEventListener('click', function () { sec.items.push(sec.type === 'features' ? { href: '#', img: 'images/.webp', imgFallback: 'images/.jpg', alt: '', label: 'New' } : { href: '#', label: 'New' }); renderMegaSections(navItem, navIdx, bodyWrap.parentNode.parentNode); });
    bodyWrap.appendChild(addIt);
  } else if (sec.type === 'footer-link') {
    bodyWrap.appendChild(field('显示文字', el('input', { type: 'text', value: sec.label || '', oninput: function (e) { sec.label = e.target.value; } })));
    bodyWrap.appendChild(field('链接', el('input', { type: 'text', value: sec.href || '', oninput: function (e) { sec.href = e.target.value; } })));
  } else if (sec.type === 'footer-section') {
    bodyWrap.appendChild(field('分栏标题', el('input', { type: 'text', value: sec.title || '', oninput: function (e) { sec.title = e.target.value; } })));
    if (!sec.links) sec.links = [];
    sec.links.forEach(function (lk, lidx) {
      var row = el('div', { class: 'link-row' });
      row.appendChild(el('input', { class: 'li', type: 'text', value: lk.label || '', placeholder: '显示文字', oninput: function (e) { lk.label = e.target.value; } }));
      row.appendChild(el('input', { class: 'lh', type: 'text', value: lk.href || '', placeholder: '链接', oninput: function (e) { lk.href = e.target.value; } }));
      var x = el('button', { class: 'x', text: '✕' }); x.addEventListener('click', function () { sec.links.splice(lidx, 1); renderSectionBody(sec, bodyWrap, navItem, navIdx); });
      row.appendChild(x);
      bodyWrap.appendChild(row);
    });
    var addLk = el('button', { class: 'addlink', text: '＋ 添加链接' });
    addLk.addEventListener('click', function () { sec.links.push({ label: '新链接', href: '#' }); renderSectionBody(sec, bodyWrap, navItem, navIdx); });
    bodyWrap.appendChild(addLk);
  }
}

function renderColumn(col, cidx, sec, navItem, navIdx) {
  var box = el('div', { class: 'col-block' });
  box.appendChild(el('div', { class: 'col-title', html: '分栏 ' + (cidx + 1) + ' <button class="x" style="float:right">✕</button>' }));
  box.querySelector('.x').addEventListener('click', function () { sec.columns.splice(cidx, 1); renderMegaSections(navItem, navIdx, box.parentNode.parentNode.parentNode); });
  box.appendChild(field('分栏标题（可空）', el('input', { type: 'text', value: col.title || '', oninput: function (e) { col.title = e.target.value; } })));
  if (col.feature) {
    box.appendChild(field('特色卡片图片', el('input', { type: 'text', value: col.feature.img || '', oninput: function (e) { col.feature.img = e.target.value; } })));
    box.appendChild(field('特色卡片文字', el('input', { type: 'text', value: col.feature.label || '', oninput: function (e) { col.feature.label = e.target.value; } })));
    box.appendChild(field('特色卡片链接', el('input', { type: 'text', value: col.feature.href || '', oninput: function (e) { col.feature.href = e.target.value; } })));
  }
  if (!col.links) col.links = [];
  col.links.forEach(function (lk, lidx) {
    var row = el('div', { class: 'link-row' });
    row.appendChild(el('input', { class: 'li', type: 'text', value: lk.label || '', placeholder: '显示文字', oninput: function (e) { lk.label = e.target.value; } }));
    row.appendChild(el('input', { class: 'lh', type: 'text', value: lk.href || '', placeholder: '链接', oninput: function (e) { lk.href = e.target.value; } }));
    var x = el('button', { class: 'x', text: '✕' }); x.addEventListener('click', function () { col.links.splice(lidx, 1); renderColumnRefresh(col, cidx, sec, navItem, navIdx, box); });
    row.appendChild(x);
    box.appendChild(row);
  });
  var addLk = el('button', { class: 'addlink', text: '＋ 添加链接' });
  addLk.addEventListener('click', function () { col.links.push({ label: '新链接', href: '#' }); renderColumnRefresh(col, cidx, sec, navItem, navIdx, box); });
  box.appendChild(addLk);
  return box;
}
function renderColumnRefresh(col, cidx, sec, navItem, navIdx, box) {
  var parent = box.parentNode;
  var fresh = renderColumn(col, cidx, sec, navItem, navIdx);
  parent.replaceChild(fresh, box);
}

function changeSectionType(sec, type) {
  sec.type = type;
  if (type === 'grid-links') { sec.columns = sec.columns || [{ links: [{ label: '新链接', href: '#' }] }]; delete sec.items; delete sec.links; }
  else if (type === 'features' || type === 'links-grid') { sec.cols = sec.cols || 4; sec.items = sec.items || [{ href: '#', label: 'New' }]; if (type === 'features') { sec.items[0].img = sec.items[0].img || 'images/.webp'; sec.items[0].imgFallback = sec.items[0].imgFallback || 'images/.jpg'; sec.items[0].alt = sec.items[0].alt || ''; } delete sec.columns; delete sec.links; }
  else if (type === 'footer-link') { sec.label = sec.label || '查看全部 →'; sec.href = sec.href || '#'; delete sec.columns; delete sec.items; delete sec.links; }
  else if (type === 'footer-section') { sec.title = sec.title || '标题'; sec.links = sec.links || [{ label: '新链接', href: '#' }]; delete sec.columns; delete sec.items; }
}

function moveSectionSafe(navItem, sidx, dir, secBox) {
  var arr = navItem.mega.sections;
  var j = sidx + dir;
  if (j < 0 || j >= arr.length) return;
  var t = arr[sidx]; arr[sidx] = arr[j]; arr[j] = t;
  renderMegaSections(navItem, parseInt(secBox.dataset.navIdx, 10), secBox);
}

// ==================== Nav 预览 ====================
function updateNavPreview() {
  var box = document.getElementById('navPreview');
  if (!box || !currentConfig || !Array.isArray(currentConfig.nav)) return;
  clear(box);
  currentConfig.nav.forEach(function (item) {
    var cls = 'n';
    if (item.type === 'mega') cls += ' mega';
    if (item.type === 'button') cls += ' btn';
    box.appendChild(el('span', { class: cls, text: item.label + (item.type === 'mega' ? ' ▾' : '') }));
  });
}

// ==================== 拖拽排序 ====================
function setupDragAndDrop() {
  var list = document.getElementById('navList');
  var dragInfo = null;

  list.addEventListener('dragstart', function (e) {
    var item = e.target.closest('[data-drag="nav"]');
    if (item) { dragInfo = { type: 'nav', idx: +item.dataset.idx }; e.dataTransfer.effectAllowed = 'move'; return; }
    var sec = e.target.closest('[data-drag="section"]');
    if (sec) { dragInfo = { type: 'section', navIdx: +sec.dataset.navIdx, secIdx: +sec.dataset.secIdx }; e.dataTransfer.effectAllowed = 'move'; }
  });

  list.addEventListener('dragover', function (e) {
    if (!dragInfo) return;
    e.preventDefault();
    var card = e.target.closest('[data-drag="' + dragInfo.type + '"]');
    list.querySelectorAll('.drop-before,.drop-after').forEach(function (n) { n.classList.remove('drop-before', 'drop-after'); });
    if (card) {
      var rect = card.getBoundingClientRect();
      var before = (e.clientY - rect.top) < rect.height / 2;
      card.classList.add(before ? 'drop-before' : 'drop-after');
    }
  });

  list.addEventListener('drop', function (e) {
    if (!dragInfo) return;
    e.preventDefault();
    var card = e.target.closest('[data-drag="' + dragInfo.type + '"]');
    list.querySelectorAll('.drop-before,.drop-after').forEach(function (n) { n.classList.remove('drop-before', 'drop-after'); });
    if (!card) { dragInfo = null; return; }
    var targetIdx = +card.dataset.idx;
    if (dragInfo.type === 'nav') {
      var arr = currentConfig.nav;
      var from = dragInfo.idx;
      var rect = card.getBoundingClientRect();
      var before = (e.clientY - rect.top) < rect.height / 2;
      var to = before ? targetIdx : targetIdx + 1;
      if (from < to) to--;
      var t = arr.splice(from, 1)[0];
      arr.splice(to, 0, t);
      renderNavList(); updateNavPreview();
    } else if (dragInfo.type === 'section') {
      var navItem = arr_findNav(dragInfo.navIdx);
      var sArr = navItem.mega.sections;
      var sFrom = dragInfo.secIdx;
      var sRect = card.getBoundingClientRect();
      var sBefore = (e.clientY - sRect.top) < sRect.height / 2;
      var sTo = sBefore ? targetIdx : targetIdx + 1;
      if (sFrom < sTo) sTo--;
      var st = sArr.splice(sFrom, 1)[0];
      sArr.splice(sTo, 0, st);
      var secBox = list.querySelector('[data-secbox="' + dragInfo.navIdx + '"]');
      if (secBox) renderMegaSections(navItem, dragInfo.navIdx, secBox);
      updateNavPreview();
    }
    dragInfo = null;
  });
}
function arr_findNav(navIdx) { return currentConfig.nav[navIdx]; }

// ==================== 保存 ====================
function saveConfig() {
  if (!currentConfig) { showToast('请先加载配置', ''); return; }
  syncHeroFromForm();

  var v = validateConfig(currentConfig);
  if (!v.ok) { setStatus('err', '校验未通过'); showToast('❌ ' + v.errors[0], 'error'); return; }

  var content = utf8ToBase64(JSON.stringify(currentConfig, null, 2));
  setStatus('busy', '保存中…');
  showToast('正在保存…', '');
  ghFetch(CONFIG_PATH, 'PUT', { message: 'Update site shell via admin', content: content, sha: currentSha })
    .then(function (r) { if (!r.ok) return r.json().then(function (d) { throw new Error(d.message || ('HTTP ' + r.status)); }); return r.json(); })
    .then(function (d) {
      currentSha = d.content.sha;
      setStatus('', '已发布 · 约 1–2 分钟生效');
      showToast('✅ 已保存并发布，站点将在 1–2 分钟内更新', 'success');
    })
    .catch(function (err) { setStatus('err', '保存失败'); showToast('保存失败：' + friendlyError(err.message || err), 'error'); });
}

// ==================== 设置 ====================
function saveSettings() {
  var token = document.getElementById('ghToken').value.trim();
  var repo = document.getElementById('ghRepo').value.trim() || 'WillyYe/myguilin.com';
  var branch = document.getElementById('ghBranch').value.trim() || 'main';
  if (!token) { showToast('请粘贴 GitHub Token', ''); return; }
  saveGhSettings(token, repo, branch);
  showToast('设置已保存 ✅', 'success');
  document.getElementById('settingsModal').classList.remove('show');
  loadConfig();
}

// ==================== 表单小部件 ====================
function field(labelText, control) {
  var wrap = el('div', { class: 'field' });
  wrap.appendChild(el('label', { class: 'fld', text: labelText }));
  wrap.appendChild(control);
  return wrap;
}
