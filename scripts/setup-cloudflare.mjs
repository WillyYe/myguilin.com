#!/usr/bin/env node
/**
 * Cloudflare 全自动化配置脚本 — myguilin.com
 *
 * 用法：
 *   CLOUDFLARE_API_TOKEN=xxx node scripts/setup-cloudflare.mjs
 *
 * 先决条件：
 *   1. 已在 Cloudflare 控制台 "Add a Site" 添加 myguilin.com 并完成 NS 切换。
 *   2. 仪表盘显示站点 Active。
 *   3. 设置环境变量 CLOUDFLARE_API_TOKEN（Zone:Read + Zone:Edit + Zone Settings:Edit + Transform Rules:Edit + Cache Rules:Edit）。
 *
 * 脚本会自动完成：
 *   - 获取 Zone ID
 *   - 创建 DNS 记录（根域 / www → willyye.github.io，橙色云代理）
 *   - 开启 SSL/TLS Full (strict)、Always Use HTTPS、Automatic HTTPS Rewrites、TLS 1.2
 *   - 配置 HSTS
 *   - 添加 Transform Rules（安全响应头）
 *   - 添加 Cache Rules（静态资源长缓存）
 */

const DOMAIN = 'myguilin.com';
const GITHUB_PAGES_TARGET = 'willyye.github.io';

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

async function cf(path, opts = {}) {
  const url = `https://api.cloudflare.com/client/v4${path}`;
  const res = await fetch(url, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok || !data.success) {
    const err = data.errors?.map(e => `${e.code}: ${e.message}`).join('; ') || res.statusText;
    throw new Error(`Cloudflare API ${opts.method || 'GET'} ${path} failed: ${err}`);
  }
  return data.result;
}

async function getZoneId() {
  const zones = await cf('/zones');
  const zone = zones.find(z => z.name === DOMAIN);
  if (!zone) throw new Error(`未在 Cloudflare 账户下找到 ${DOMAIN}。请先在 Cloudflare 控制台添加站点并完成 NS 切换。`);
  if (zone.status !== 'active') throw new Error(`Zone ${DOMAIN} 状态为 ${zone.status}，请等待 NS 生效。`);
  return zone.id;
}

async function configureDns(zoneId) {
  const records = await cf(`/zones/${zoneId}/dns_records`);
  const wanted = [
    { type: 'CNAME', name: DOMAIN, content: GITHUB_PAGES_TARGET, proxied: true },
    { type: 'CNAME', name: 'www', content: GITHUB_PAGES_TARGET, proxied: true },
  ];

  for (const rec of wanted) {
    const fullName = rec.name === DOMAIN ? DOMAIN : `${rec.name}.${DOMAIN}`;
    const existing = records.find(r => r.type === rec.type && r.name === fullName);
    const body = { ...rec, ttl: 1 };
    if (existing) {
      console.log(`  更新 DNS: ${rec.type} ${fullName} → ${rec.content}`);
      await cf(`/zones/${zoneId}/dns_records/${existing.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    } else {
      console.log(`  创建 DNS: ${rec.type} ${fullName} → ${rec.content}`);
      await cf(`/zones/${zoneId}/dns_records`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }
  }
}

async function configureSsl(zoneId) {
  console.log('  设置 SSL/TLS 为 Full (strict)');
  await cf(`/zones/${zoneId}/settings/ssl`, {
    method: 'PATCH',
    body: JSON.stringify({ value: 'full_strict' }),
  });

  console.log('  开启 Always Use HTTPS');
  await cf(`/zones/${zoneId}/settings/always_use_https`, {
    method: 'PATCH',
    body: JSON.stringify({ value: 'on' }),
  });

  console.log('  开启 Automatic HTTPS Rewrites');
  await cf(`/zones/${zoneId}/settings/automatic_https_rewrites`, {
    method: 'PATCH',
    body: JSON.stringify({ value: 'on' }),
  });

  console.log('  设置 Minimum TLS Version 1.2');
  await cf(`/zones/${zoneId}/settings/min_tls_version`, {
    method: 'PATCH',
    body: JSON.stringify({ value: '1.2' }),
  });

  console.log('  开启 HSTS');
  await cf(`/zones/${zoneId}/settings/security_header`, {
    method: 'PATCH',
    body: JSON.stringify({
      value: {
        strict_transport_security: {
          enabled: true,
          max_age: 63072000,
          include_subdomains: true,
          preload: false,
        },
      },
    }),
  });
}

async function getOrCreateRuleset(zoneId, phase) {
  const rulesets = await cf(`/zones/${zoneId}/rulesets`);
  let rs = rulesets.find(r => r.phase === phase);
  if (rs) return rs;

  console.log(`  创建 ruleset phase=${phase}`);
  rs = await cf(`/zones/${zoneId}/rulesets`, {
    method: 'POST',
    body: JSON.stringify({
      kind: 'zone',
      phase,
      name: phase === 'http_response_headers_transform' ? 'Zone-level Response Headers Transform Ruleset' : 'Zone-level Cache Ruleset',
      description: `Managed by scripts/setup-cloudflare.mjs for ${DOMAIN}`,
      rules: [],
    }),
  });
  return rs;
}

async function configureTransformRules(zoneId) {
  const phase = 'http_response_headers_transform';
  const rs = await getOrCreateRuleset(zoneId, phase);
  const ruleName = 'myguilin-security-headers';

  const rules = rs.rules || [];
  const newRules = rules.filter(r => r.description !== ruleName);
  newRules.push({
    description: ruleName,
    expression: '(http.host eq "myguilin.com" or http.host eq "www.myguilin.com")',
    action: 'rewrite',
    action_parameters: {
      headers: {
        'X-Content-Type-Options': { operation: 'set', value: 'nosniff' },
        'X-Frame-Options': { operation: 'set', value: 'DENY' },
        'Referrer-Policy': { operation: 'set', value: 'strict-origin-when-cross-origin' },
        'Permissions-Policy': { operation: 'set', value: 'geolocation=(), microphone=(), camera=()' },
      },
    },
  });

  console.log('  更新 Response Header Transform Rules');
  await cf(`/zones/${zoneId}/rulesets/${rs.id}`, {
    method: 'PUT',
    body: JSON.stringify({ rules: newRules }),
  });
}

async function configureCacheRules(zoneId) {
  const phase = 'http_request_cache_settings';
  const rs = await getOrCreateRuleset(zoneId, phase);
  const ruleName = 'myguilin-static-cache';

  const rules = rs.rules || [];
  const newRules = rules.filter(r => r.description !== ruleName);
  newRules.push({
    description: ruleName,
    expression: '(http.request.uri.path contains ".webp") or (http.request.uri.path contains ".jpg") or (http.request.uri.path contains ".png") or (http.request.uri.path contains ".svg") or (http.request.uri.path contains ".woff2") or (http.request.uri.path contains ".woff") or (http.request.uri.path contains ".css") or (http.request.uri.path contains ".js")',
    action: 'set_cache_settings',
    action_parameters: {
      cache: true,
      edge_ttl: { mode: 'override_origin', default: 2592000 },
      browser_ttl: { mode: 'override_origin', default: 2592000 },
    },
  });

  console.log('  更新 Cache Rules');
  await cf(`/zones/${zoneId}/rulesets/${rs.id}`, {
    method: 'PUT',
    body: JSON.stringify({ rules: newRules }),
  });
}

function printManual() {
  console.log(`
未检测到 CLOUDFLARE_API_TOKEN 环境变量。以下是 Cloudflare 接入的完整清单，
可交给 WorkBuddy 在获取 token 后全自动执行，或按清单手动配置。

步骤 1：在 Cloudflare 控制台添加站点
- 登录 https://dash.cloudflare.com （账户：mydeng1995）
- Add a Site → 输入 ${DOMAIN}
- 选择 Free 计划

步骤 2：改域名 DNS 服务器（只能你在阿里云操作）
- 登录阿里云控制台 → 域名 → ${DOMAIN} → 修改 DNS 服务器
- 把当前 dns23/24.hichina.com 换成 Cloudflare 给你的 2 个 NS（形如 xxx.ns.cloudflare.com）
- 等待 Cloudflare 仪表盘显示 Active（通常几分钟到几小时）

步骤 3：获取 API Token（给 WorkBuddy 用来自动化）
- Cloudflare 控制台 → My Profile → API Tokens → Create Token
- 使用模板 "Edit zone DNS"，额外权限：
  - Zone:Read
  - Zone:Edit
  - Zone Settings:Edit
  - Transform Rules:Edit
  - Cache Rules:Edit
- 适用范围：Include - Zone: ${DOMAIN}

步骤 4：运行自动化脚本
  CLOUDFLARE_API_TOKEN=xxx node scripts/setup-cloudflare.mjs

脚本将自动完成：
- 创建 DNS 记录：${DOMAIN} CNAME ${GITHUB_PAGES_TARGET}（代理）
- 创建 DNS 记录：www.${DOMAIN} CNAME ${GITHUB_PAGES_TARGET}（代理）
- SSL/TLS 设置为 Full (strict)
- 开启 Always Use HTTPS、Automatic HTTPS Rewrites、Minimum TLS 1.2
- 开启 HSTS（max-age=63072000, includeSubDomains）
- 添加 Transform Rules：X-Content-Type-Options、X-Frame-Options、Referrer-Policy、Permissions-Policy
- 添加 Cache Rules：静态资源（图片/字体/CSS/JS）缓存 30 天
`);
}

async function main() {
  if (!TOKEN) {
    printManual();
    process.exit(0);
  }

  console.log(`开始为 ${DOMAIN} 配置 Cloudflare...`);
  const zoneId = await getZoneId();
  console.log(`  Zone ID: ${zoneId}`);

  await configureDns(zoneId);
  await configureSsl(zoneId);
  await configureTransformRules(zoneId);
  await configureCacheRules(zoneId);

  console.log('Cloudflare 配置完成。');
  console.log('提示：改 NS 后，建议用以下命令验证：');
  console.log('  curl -sI https://myguilin.com/ | grep -iE "strict-transport|x-content|frame|referrer|permissions"');
}

main().catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});
