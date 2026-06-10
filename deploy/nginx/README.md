# nginx 配置（4seas 服务器 /residency 反代）

这两个文件是 **4seas 服务器**（149.28.158.244）上线上 nginx 配置的副本，
此处入库存档；改动时先改服务器、验证通过后同步回本目录。

| 仓库路径 | 服务器路径 |
|---|---|
| `conf.d/4seas-rsc-cache.conf` | `/etc/nginx/conf.d/4seas-rsc-cache.conf` |
| `snippets/4seas-next-proxy.conf` | `/etc/nginx/snippets/4seas-next-proxy.conf` |

snippet 由 `/etc/nginx/sites-available/4seas-site` 的 `location ^~ /residency` 引用。

## 背景：手机"弹下载"事故（2026-06-10 修复）

现象：手机打开 4seas.xyz 点进 /residency，偶发浏览器弹出"下载"而非渲染页面。

根因：Next.js App Router 在同一 URL 上按 `RSC: 1` 等请求头返回
HTML 或 `text/x-component`（RSC 数据流）。residency 是预渲染页，响应带
`s-maxage=31536000` 且对浏览器无禁缓存指令；部分手机浏览器（iOS WebKit 等）
对 `Vary` 处理不严，把 RSC 流缓存在裸 URL 名下，回放时撞上全站
`X-Content-Type-Options: nosniff`，无法当 HTML 渲染 → 只能下载。

修复：`map $upstream_http_content_type` → 凡 `text/x-component` 响应一律改写
`Cache-Control: no-store`，其余响应（HTML 的 s-maxage、_next 静态资源的
immutable）原样透传。基于内容类型判断，新增页面自动覆盖。

注意：location 内出现 `add_header` 会取消 server 级继承的安全头，
所以 snippet 末尾重新 include 了 `snippets/security-headers.conf`。

## 应用方法

```bash
cp conf.d/4seas-rsc-cache.conf /etc/nginx/conf.d/
cp snippets/4seas-next-proxy.conf /etc/nginx/snippets/
nginx -t && systemctl reload nginx
```

## 验证

```bash
# RSC 数据流 → 必须是 no-store
curl -sI -H 'RSC: 1' https://4seas.xyz/residency | grep -i 'content-type\|cache-control'
# content-type: text/x-component
# cache-control: no-store

# 正常 HTML → s-maxage 保留
curl -sI https://4seas.xyz/residency | grep -i 'content-type\|cache-control'
# content-type: text/html; charset=utf-8
# cache-control: s-maxage=31536000
```

## 相关的 Cloudflare 配置（不在本仓库）

CF 后台另有一条 Cache Rule：`starts_with(http.request.uri.path, "/residency")`
→ **Bypass cache**。防的是将来误开 Cache Everything 时，CF（会忽略 Vary）
把 RSC 流缓存到边缘导致全网串台。新版 Cache Rules 的 bypass 在
`cf-cache-status` 里显示为 `DYNAMIC`（而非 `BYPASS`），属正常。
