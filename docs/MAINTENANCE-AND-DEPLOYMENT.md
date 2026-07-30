# 4Seas Residency 维护与部署

本文是当前有效的代码、发布和生产维护手册。历史 Vercel/Supabase 方案保留在 PRD、技术设计和迁移记录中，但不再是生产操作依据。

## 1. 当前权威边界

- Canonical repo 与工单：`https://tea.4seas.xyz/4Seas/residency`
- 生产分支：Tea 的 `main`
- GitHub：公开只读镜像，用于 CI/preview，不接受生产变更
- 对外路径：`https://4seas.xyz/residency`
- 运行服务：`4seas-residency.service`
- 生产端口：VPS 本机 `3005`
- 当前发布链接：`/opt/4seas-residency/current`
- 环境文件：`/etc/4seas-residency/env`
- 生产数据库：Supabase PostgreSQL（服务端通过 `DATABASE_URL` 连接）
- 邮件：4Seas Stalwart SMTP/IMAP

生产凭据、申请者数据、数据库备份和服务器地址不得进入仓库、Issue 或 PR。

## 2. 日常变更

1. 在 Tea 创建 Issue，写明现象、范围和验收条件。
2. 从最新 `origin/main` 创建短期分支和独立 worktree。
3. 只修改 Issue 范围内的内容，保留 PostgreSQL、Cookie 鉴权、邮件回复与 `/residency` 路由。
4. 本地至少运行：

   ```bash
   pnpm install --frozen-lockfile
   pnpm typecheck
   COREPACK_ENABLE_PROJECT_SPEC=0 NEXT_PUBLIC_BASE_PATH=/residency pnpm build
   ```

5. 页面或交互改动必须在浏览器中验证。
6. 推送分支，在 Tea 创建 PR，并关联 Issue。
7. CI 通过且无冲突后才可合并。

## 3. Preview

Tea 的 `main` 镜像到 GitHub。GitHub Actions 构建相同提交，并通过 token 保护的部署接收端发布到独立 preview VM。

Preview 使用：

- `/residency` base path；
- 生产 Supabase 项目中的 `residency_preview` 隔离 schema；
- 独立管理员凭据；
- 合成申请记录；
- 不会读取或写入生产申请表。

具体流程见 `deploy/preview/README.md`。

## 4. 生产发布

生产发布以已经合并并通过 CI 的 `main` 提交为唯一来源：

1. 拉取最新 Tea `main`，记录完整 commit SHA。
2. 在干净的 detached worktree 中安装依赖并执行生产构建。
3. 从 `.next/standalone`、`.next/static` 和 `public` 制作不可变发布包。
4. 上传后比对 SHA-256；不一致时停止，不得解压或切换。
5. 解压到 `/opt/4seas-residency/releases/<timestamp>-<sha>`。
6. 校验属主和运行文件，通过临时符号链接原子切换 `current`。
7. 重启 `4seas-residency.service`。
8. 保留上一个发布目录，直到新版本验收完成。

首次端口探测可能早于 Next.js 开始监听，应在服务进入 `active` 且日志出现 ready 后复检，不能把一次过早探测当成最终失败或成功。

## 5. 上线验收

每次发布至少确认：

- systemd 服务为 `active`，当前链接指向预期 commit 的 release；
- `/residency`、track 页面、申请页和后台登录页返回正常；
- 管理员可以登录并读取申请列表；
- 本次修改涉及的真实交互可以完成；
- 服务日志和浏览器没有新增运行时错误。

涉及申请提交、数据库写入或邮件时，使用安全的测试数据完成写入验证，随后精确删除测试记录并确认计数恢复。未经明确授权，不向真实申请人发送测试邮件。

## 6. 数据库变更

- 生产唯一业务数据库是 Supabase PostgreSQL；浏览器不直连，所有访问均经过服务端。
- schema 变更应在 `supabase/migrations/` 新增有序 SQL 文件，并明确目标表、列、默认值、NULL/日期转换及兼容窗口。
- 变更前创建非空、可恢复并经过 `pg_restore --list` 或等价方式验证的备份。
- 优先采用向前兼容迁移；删除列、删除表或批量转换必须拆分并单独审批。

## 7. 环境与鉴权

生产环境使用以下变量；`IMAP_*` 未设置时会回退到对应的 SMTP 主机和账号：

```text
DATABASE_URL
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASSWORD
EMAIL_FROM
EMAIL_REPLY_TO
IMAP_HOST
IMAP_PORT
IMAP_SECURE
IMAP_USER
IMAP_PASSWORD
ADMIN_PASSWORD
SESSION_SECRET
IP_HASH_SALT
CRON_SECRET
NEXT_PUBLIC_SITE_URL
```

环境文件修改前先创建 root-only 回滚副本。修改后重启服务，并以真实登录或对应功能验证配置已生效。端口可达或 TLS 握手成功不等于邮件已经送达。

## 8. 回滚

应用回滚：

1. 将 `current` 原子切回上一已验证 release。
2. 重启服务并执行关键冒烟检查。
3. 在 Tea Issue/PR 记录原因、影响和回滚版本。
4. 创建 revert 或 follow-up PR，使 `main` 与生产重新一致。

数据库不执行未经验证的破坏性 down migration。优先部署兼容代码和向前修复；只有明确恢复点、影响范围和授权后才执行数据库恢复。

## 9. 完成标准

一次生产修改只有在以下全部成立后才算完成：

1. Issue 的验收条件已实现。
2. PR CI 通过并合并到 Tea `main`。
3. 部署的 release 对应精确的合并 commit。
4. 服务、页面、鉴权和本次功能经过真实验证。
5. 数据库、环境或邮件变更已有备份和结果记录。
6. Issue 更新最终证据并关闭。
