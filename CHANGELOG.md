# Changelog
> 规范：遵循 [Keep a Changelog](https://keepachangelog.com/) 与 Conventional Commits。  
> 时间为本地时间；功能以用户可见变化为准。

## [Unreleased]

## [0.4.0] - 2025-08-25 — M3：付费游戏访问控制（中间件保护）
### Added
- 新增 `src/middleware.ts`：保护 `/games/premium/*` 路由的中间件
- 新增 `/games/premium/[slug]` 路由：动态付费游戏页面
- 新增 `/games/premium/demo` 页面：会员专享示例页，用于中间件功能验证
- 实现完整的访问控制逻辑：
  - 未登录用户 → 重定向到 `/login`
  - 已登录但非会员用户 → 重定向到 `/billing`
  - 已登录且是会员用户 → 允许访问
- 支持外部游戏链接（如 Fishy Game）
- 添加会员专享标识和游戏信息显示

### Fixed
- 修复中间件文件位置问题：从根目录移动到 `src/` 目录
- 修复中间件配置：使用正确的 matcher 配置

### Changed
- 更新首页：添加 M3 中间件测试链接
- 优化中间件日志：添加详细的调试信息

### Docs
- 更新中间件功能说明
- 完善付费游戏访问控制文档

## [0.3.1] - 2025-08-24 — M2：支付系统完善（Webhook 修复与订阅管理）
### Added
- 新增 `/api/checkout/verify` API：支付状态验证和备用处理机制
- 新增 `/api/subscription/cancel` API：订阅取消功能
- 更新 `/billing` 页面：添加取消订阅按钮和会员状态显示
- 改进支付流程：成功 URL 包含 session_id 参数
- 完善错误处理：提供可读的错误提示，避免静默失败
- 添加幂等性检查：防止重复处理同一支付事件

### Fixed
- **修复 Webhook 处理问题**：本地开发环境无法接收 Stripe webhook 事件
- **修复会员状态更新**：支付后会员状态不更新的问题
- **修复订阅取消逻辑**：实现立即取消订阅，而非到期取消
- **修复 UI 状态同步**：取消订阅后 UI 不更新的问题
- **修复重复订阅**：防止用户重复订阅同一产品
- **修复 RLS 权限问题**：使用 service role 客户端处理服务器端操作

### Changed
- 简化订阅逻辑：取消后立即结束订阅，重新订阅开始新周期
- 优化 UI 显示：隐藏一次性购买选项，调整订阅卡片布局
- 改进用户体验：添加支付说明和客服邮箱
- 更新支付说明：明确取消和重新订阅的政策

### Docs
- 更新支付测试指南
- 完善错误处理文档

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
