# 4Seas Residency

当前生产环境布局与数据所有权：[ARCHITECTURE.md](./ARCHITECTURE.md)。

清迈 4Seas 驻留项目（加密 / 艺术 / 长寿）的营销网站、申请漏斗和管理员审核面板。

产品规格：[docs/PRD.md](./docs/PRD.md) · 技术设计：[docs/TECH-DESIGN.md](./docs/TECH-DESIGN.md) · 维护与部署：[docs/MAINTENANCE-AND-DEPLOYMENT.md](./docs/MAINTENANCE-AND-DEPLOYMENT.md)

## 技术栈

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Supabase PostgreSQL · Stalwart SMTP/IMAP · 4Seas VPS

**架构一言以蔽之：** 浏览器绝不直接接触数据库或邮箱；VPS 应用直接与 Supabase PostgreSQL 和 4Seas 邮件服务器通信。
