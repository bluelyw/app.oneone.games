# Changelog
> 规范：遵循 [Keep a Changelog](https://keepachangelog.com/) 与 Conventional Commits。  
> 时间为本地时间；功能以用户可见变化为准。

## [Unreleased]

## [0.3.0] - 2025-08-24 — M2：支付系统（Stripe 集成）
### Added
- 集成 Stripe 支付系统
- 创建数据库表：`profiles`, `memberships`, `purchases`
- 新增 `/api/checkout/session` API：创建 Stripe Checkout Session
- 新增 `/api/webhooks/stripe` API：处理 Stripe Webhook 事件
- 更新 `/billing` 页面：订阅和一次性购买按钮
- 更新 `/account` 页面：显示会员状态和订单记录
- 配置 Stripe 产品：订阅 `prod_SvLnLyJhWgjFuS`，一次性购买 `prod_SvLnRsC6q7uf1W`
- 配置 Webhook 端点：`https://app.oneone.games/api/webhooks/stripe`

### Fixed
- 修复 Supabase 数据库迁移 SQL 中的视图策略错误

### Docs
- 新增 `STRIPE_CONFIG.md` 详细配置文档
- 更新 README.md 添加 Stripe 配置说明
- 完善环境变量配置要求

## [0.2.1] - 2025-08-23 — M1 功能恢复与规范完善
### Added
- 恢复完整的 M1 Supabase Auth 功能
- 新增文件创建规范文档
- 新增版本号管理规范

### Fixed
- 修复文件创建失败问题
- 完善 GitHub 同步流程

### Docs
- README：增加开发规范和版本号要求
- 明确文件创建最佳实践
- 规范版本号管理流程

## [0.2.0] - 2025-08-23 — M1：账号体系（Supabase Auth）
### Added
- 集成 Supabase Auth（基于 `@supabase/ssr`，SSR 读取 session）。
- 新增登录页 `/login`、注册页 `/signup`（魔法链接登录）。
- `layout.tsx` 服务端读取 session，Header 显示「登录/注册 / 账户 / 退出」。
- 账户页 `/account`：展示邮箱、用户 ID、创建时间、最后登录时间。未登录访问自动 302 到 `/login`。
- 仓库只维护 env.example，本地必须创建 .env.local 并填入实际值。

### Docs
- README：增加本地运行步骤与环境变量说明。

## [0.1.0] - 2025-08-22 — M0：项目脚手架与基础页
### Added
- 初始化 Next.js 15 + TypeScript（App Router + Tailwind）。
- 新增基础路由：`/login` `/signup` `/account` `/billing`（占位页）。
- `NEXT_PUBLIC_APP_URL` 环境变量接入；页面顶部显示 `NODE_ENV` 与 `NEXT_PUBLIC_APP_URL`。
- 生成 `.env.example`（仅变量名，无密钥）。
