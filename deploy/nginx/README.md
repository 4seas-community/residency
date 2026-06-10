# /residency 部署与页面行为说明（nginx 配置 + 维护手册）

本目录存档 **4seas 服务器**（149.28.158.244）上与 residency 应用相关的线上
nginx 配置，并说明每个页面的渲染/缓存/认证行为，供后续开发维护参考。
约定：**先改服务器、线上验证通过后，再同步回本目录。**

| 仓库路径 | 服务器路径 |
|---|---|
| `conf.d/4seas-rsc-cache.conf` | `/etc/nginx/conf.d/4seas-rsc-cache.conf` |
| `snippets/4seas-next-proxy.conf` | `/etc/nginx/snippets/4seas-next-proxy.conf` |

snippet 由 `/etc/nginx/sites-available/4seas-site` 的 `location ^~ /residency` 引用。

## 1. 4seas.xyz 路由拓扑

| 路径 | 由谁服务 | 源码位置 |
|---|---|---|
| `/` 及 `/css` `/js` `/images` | nginx 直接发静态文件 | 服务器 `/opt/4seas-home/current`（Webflow 导出，homepage 仓库） |
| `/residency/**` | 本应用：Next.js standalone，`127.0.0.1:3005` | 本仓库（但见第 4 节⚠️） |
| `book.` `event.` `lib.` `tea.` 子域 | 各自独立服务 | 与本配置无关 |

- 应用以 `basePath=/residency` 构建（`NEXT_PUBLIC_BASE_PATH`），静态资源在
  `/residency/_next/**`，同走上面的 location。
- 运行方式：systemd 服务 **`4seas-residency.service`**（User=residency，
  `node /opt/4seas-residency/current/server.js`，EnvironmentFile
  `/etc/4seas-residency/env`）。
- 全站经 Cloudflare 代理；CF 另有一条 Cache Rule，见第 6 节。

## 2. 页面清单（线上 2026-06-07 构建，BUILD_ID `m5DtRwrm5VJmfI6WSjeZa`）

全部页面均为**构建时预渲染**（prerender-manifest 共 12 条路由，无运行时动态页）。
下表"直接打开"= 浏览器地址栏访问返回的 HTML；"站内导航"= Next 路由器取的
RSC 数据流（`text/x-component`），其 `Cache-Control: no-store` 由本目录的
nginx map 强制改写——这是 2026-06-10 手机"弹下载"事故的修复，见第 5 节。

| 路径（/residency 前缀略） | 内容 | 直接打开 HTML | 认证 |
|---|---|---|---|
| `/` | 项目总览落地页（"4Seas Residency Programs"，链向三个项目） | `s-maxage=31536000` | 公开 |
| `/art` `/crypto` `/longevity` | 三个项目介绍页，由动态段 `app/[program]` 静态生成 | 同上 | 公开 |
| `/apply` | 通用申请表（"Apply for Residency"，client 组件表单） | 同上 | 公开 |
| `/art/apply` `/crypto/apply` `/longevity/apply` | 各项目申请表（如 "Apply for Art Residency"） | 同上 | 公开 |
| `/admin` | 管理后台登录/入口 | 同上 | **页面壳公开**，见下 |
| `/admin/applications` | 申请管理列表 | 同上 | **页面壳公开**，见下 |

**admin 两页注意**：它们是预渲染的公开壳，未登录也返回 200，鉴权全靠客户端
调 `/api/admin/session` + API 层 401。**不要在这两页的服务端渲染部分放任何
敏感数据**——放了就等于公开。

已知小问题：`<title>` 全站共用 "4Seas Crypto Residency Program | Chiang Mai"，
连 `/art` `/longevity` 也写着 Crypto（layout 级 metadata，页面未覆写）。

### API 路由（全部运行时动态，不预渲染、无缓存头）

| 路径 | 用途 | 认证 |
|---|---|---|
| `POST /api/applications` | 公开提交申请 | 公开 |
| `POST /api/admin/login` / `POST /api/admin/logout` / `GET /api/admin/session` | 管理会话 | login 公开，其余凭会话 |
| `GET/… /api/admin/applications`、`…/[id]`、`…/[id]/comments`、`…/[id]/comments/[commentId]` | 申请的增删改查与评论 | 未登录一律 401 |

## 3. 双变体机制（开发者必读）

Next.js App Router 在**同一个页面 URL** 上返回两种内容：普通请求 → HTML；
带 `RSC: 1` / `Next-Router-Segment-Prefetch` 等头的请求 → `text/x-component`
数据流，靠 `Vary` 区分。预渲染页的响应带 `s-maxage=31536000`。

- 部分手机浏览器（iOS WebKit 为主）对 `Vary` 处理不严，会把 RSC 流缓存在
  裸 URL 名下；回放时撞上全站 `X-Content-Type-Options: nosniff`，无法当
  HTML 渲染 → 弹"下载"。这就是 2026-06-10 的线上事故。
- 修复：nginx 按**响应内容类型**兜底——凡 `text/x-component` 一律改写
  `Cache-Control: no-store`，其余响应（HTML 的 s-maxage、`_next` 静态资源的
  `immutable`）原样透传。
- 因为按内容类型判断，**新增页面自动被覆盖，不需要改 nginx**；把某页改成
  `force-dynamic` 也不影响安全性。
- snippet 末尾的 `include snippets/security-headers.conf` **不可删**：
  location 内一旦出现 `add_header`，server 级继承的安全头会全部失效，
  必须在 location 内重新引入。

## 4. ⚠️ 线上代码与仓库不同步（2026-06-10 核查发现）

线上构建包含 `app/[program]/`（生成 `/art` `/crypto` `/longevity` 三页及各自
`/apply`），但**本仓库所有分支、全部提交历史里都没有这个目录**。

- 部署产物属主为 uid 501（macOS 用户），且夹带 `._*` AppleDouble 文件——
  说明 standalone 是在某台 Mac 本地构建后上传的，源码未推回仓库。
- **风险：谁要是从 `main` 构建并部署，三个项目页和申请页会直接消失。**
- 行动项：找到那份本地源码，把 `app/[program]` 等改动补提交回仓库后，
  方可恢复"仓库 = 线上"的状态；在那之前不要从 main 部署。

部署机制（与 booking 一致的"本地构建 + 上传切链"）：
`/opt/4seas-residency/releases/<时间戳>/` ← 上传 standalone 产物，
`current` 软链切到新 release，`systemctl restart 4seas-residency`。

## 5. nginx 配置应用方法

```bash
cp conf.d/4seas-rsc-cache.conf /etc/nginx/conf.d/
cp snippets/4seas-next-proxy.conf /etc/nginx/snippets/
nginx -t && systemctl reload nginx
```

## 6. 验证

```bash
# 每个页面跑两种变体；RSC 必须 no-store，HTML 必须保留 s-maxage
for p in / /art /crypto /longevity /apply /art/apply /crypto/apply /longevity/apply /admin /admin/applications; do
  echo "== /residency$p"
  curl -sI -H 'RSC: 1' "https://4seas.xyz/residency$p" | grep -i '^cache-control'   # 期望 no-store
  curl -sI "https://4seas.xyz/residency$p" | grep -i '^cache-control'               # 期望 s-maxage=31536000
done
```

## 7. 相关的 Cloudflare 配置（不在本仓库，后台手工配置）

Cache Rule：`starts_with(http.request.uri.path, "/residency")` → **Bypass cache**
（2026-06-10 添加）。防的是将来误开 Cache Everything 时，CF（忽略 Vary）把
RSC 流缓存到边缘造成全网串台。注意两点：

- 新版 Cache Rules 的 bypass 在 `cf-cache-status` 里显示 **`DYNAMIC`**（不是
  `BYPASS`），属正常；验证规则是否生效要用对照法——规则范围内的 `.css`
  重复请求始终 `DYNAMIC`，范围外的应 `MISS → HIT`。
- 该规则也使 `/residency/_next/**` 静态资源不走 CF 边缘缓存（浏览器端
  `immutable` 缓存不受影响）；属已知取舍，流量小，保持简单优先。
