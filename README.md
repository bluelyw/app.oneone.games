# app.oneone.games

## 背景
- Homepage (www.oneone.games)：Hugo/静态，做营销与入口。
- 本项目 (app.oneone.games / Next.js)：承载账号、支付/会员、付费游戏访问控制。

## 目标
- A. 账号体系：登录/注册/退出、资料管理（Supabase Auth 优先）。
- B. 支付&会员：Stripe Checkout（订阅+一次性）、Webhook 同步会员状态、/account 展示、/billing 开通管理。
- C. 付费游戏访问控制：/games/premium/[slug] 路由；middleware 校验
  - 未登录 → /login
  - 未开通会员 → /billing
  - 已是会员 → 正常进入
  - 初期资源：反向代理至现有独立子域项目（最小改造），长期可迁 Supabase Storage/S3 + 签名 URL。

## 非目标（v0 不做）
- 免费游戏收敛与改造
- 大规模资源迁移与 CDN 优化

## 技术要求
- Next.js 15（App Router, TS）
- 部署：Vercel（Pro）
- 后端：Supabase（Auth/DB/Storage），与 Vercel 区域尽量对齐
- 支付：Stripe（Checkout + Billing Portal + Webhooks）
- 安全：受控路由 + 中间件；勿将付费资源放 /public 暴露

## 环境变量（本地 .env.local，勿提交）
- NEXT_PUBLIC_SUPABASE_URL=
- NEXT_PUBLIC_SUPABASE_ANON_KEY=
- SUPABASE_SERVICE_ROLE_KEY=
- STRIPE_SECRET_KEY=
- STRIPE_WEBHOOK_SECRET=
- NEXTAUTH_SECRET=（若用）
- NEXT_PUBLIC_APP_URL=https://app.oneone.games

## 路由要点
- /login /signup /account /billing
- /games/premium/[slug]
- /api/checkout/session（创建 Stripe 会话）
- /api/webhooks/stripe（同步会员/订单）
- /api/proxy/premium/[slug]（可选：反向代理示例）

## 里程碑
- ✅ M0：脚手架、环境变量读取、基础页面（/login /billing /account 占位）
  - ✅ Next.js 15 + TypeScript + Tailwind CSS 项目初始化
  - ✅ 基础页面结构：/login, /signup, /account, /billing
  - ✅ 环境变量配置和读取
  - ✅ 本地开发环境搭建
- ✅ M1：Supabase Auth 登录/注册打通；/account 显示用户信息
  - ✅ 集成 @supabase/ssr 包
  - ✅ 魔法链接登录/注册功能
  - ✅ Header 显示用户登录状态
  - ✅ /account 页面显示用户信息
  - ✅ 未登录访问 /account 自动跳转 /login
- ✅ M2：Stripe Checkout & Webhook；数据库记录会员/购买状态
  - ✅ 集成 Stripe 支付系统（订阅和一次性购买）
  - ✅ 创建数据库表：profiles, memberships, purchases
  - ✅ 实现 Webhook 事件处理（支付成功、订阅状态变更）
  - ✅ 支付状态验证和备用处理机制
  - ✅ 订阅取消功能
  - ✅ 会员状态实时更新
  - ✅ 错误处理和幂等性检查
- M3：middleware 保护 /games/premium/*；示例 premium 游戏入口页
- M4：（可选）反向代理到现有子域示例；日志与错误提示

## 本地开发

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境变量配置
1. 复制环境变量示例文件：
```bash
cp env.example .env.local
```

2. 编辑 `.env.local` 文件，填入相应的配置值：
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 服务角色密钥
- `STRIPE_SECRET_KEY`: Stripe 密钥
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook 密钥
- `NEXTAUTH_SECRET`: NextAuth 密钥（如果使用）
- `NEXT_PUBLIC_APP_URL`: 应用 URL（本地开发可设为 http://localhost:3000）

### 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
npm start
```

## 开发规范

### 文件创建规范
为了避免文件创建失败的问题，请遵循以下规范：

#### 推荐方式：使用命令行创建文件
```bash
# 使用 cat 命令创建文件（推荐）
cat > src/lib/supabase-client.ts << 'EOF'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  // 文件内容
}
EOF

# 或者使用 echo 命令
echo '文件内容' > filename.ts
```

#### 创建后立即验证
```bash
# 检查文件是否创建成功
ls -la src/lib/
cat src/lib/supabase-client.ts
```

#### 避免的问题
- 不要依赖工具的抽象层，直接使用命令行
- 一次创建一个文件，确保成功后再创建下一个
- 使用绝对路径确保在正确的目录中创建文件

### 版本号规范
每次发布新版本时，必须更新版本号：

#### 版本号格式
- 遵循 [语义化版本](https://semver.org/)：`主版本.次版本.修订版本`
- 示例：`0.2.1`

#### 版本号对应关系
- M0 → v0.1.0
- M1 → v0.2.0
- M1 修复 → v0.2.1
- M2 → v0.3.0
- M2 完善 → v0.4.0
- M3 → v0.5.0
- M4 → v0.6.0

#### 更新版本号的位置
1. **CHANGELOG.md**：添加新版本记录
2. **package.json**：更新 version 字段
3. **Commit 信息**：包含版本号

## 验收（DoD）
- 未登录访问 /games/premium/foo → 302 到 /login
- 普通用户访问 /games/premium/foo → 302 到 /billing
- 会员访问 /games/premium/foo → 200，页面可见
- 支付成功后 60s 内 /account 能看到已开通状态
- 订阅取消后立即生效，状态变为"已取消"
- 重新订阅后立即激活，状态变为"活跃"
- 防止重复订阅，已有活跃订阅时无法再次订阅

## GitHub 同步规范

### 同步流程
每次完成重要功能或里程碑后，按以下步骤同步到 GitHub：

1. **更新版本号**
   ```bash
   # 更新 package.json 中的 version 字段
   # 在 CHANGELOG.md 中添加新版本记录
   ```

2. **更新 CHANGELOG.md**
   ```bash
   # 在 CHANGELOG.md 中添加新版本记录
   # 遵循 Keep a Changelog 规范
   ```

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: v0.2.1 - 恢复完整的 M1 功能"
   ```

4. **推送到 GitHub**
   ```bash
   git push origin main
   ```

### 版本规范
- 遵循 [语义化版本](https://semver.org/)：`主版本.次版本.修订版本`
- 里程碑对应版本：
  - M0 → v0.1.0
  - M1 → v0.2.0
  - M1 修复 → v0.2.1
  - M2 → v0.3.0
  - M3 → v0.4.0
  - M4 → v0.5.0

### Commit 规范
- 使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式
- 类型：`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- 示例：`feat: v0.2.1 - 恢复完整的 M1 功能`

### 注意事项
- 确保 `.env.local` 文件已添加到 `.gitignore`
- 只提交 `env.example` 模板文件
- 每次同步前检查敏感信息是否已排除
- 每次发布必须更新版本号

## Stripe 支付配置

### 产品配置
- **订阅产品 ID**: `prod_SvLnLyJhWgjFuS` ($1.99/月)
- **价格 ID**: `price_1RzV5e2LpjuxOcVX2VtbPCr7` (订阅)
- **一次性购买产品 ID**: `prod_SvLnRsC6q7uf1W` (已隐藏)

### 必需环境变量
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 详细配置
请参考 `STRIPE_CONFIG.md` 文件获取完整的 Stripe 配置说明。

### Webhook 端点
```
https://app.oneone.games/api/webhooks/stripe
```

### 支付功能特性
- **订阅管理**：支持订阅和取消订阅
- **立即取消**：取消订阅后立即生效，无需等待周期结束
- **重新订阅**：取消后可重新订阅，开始新的订阅周期
- **状态同步**：支付成功后自动更新会员状态
- **错误处理**：提供可读的错误提示，避免静默失败
- **幂等性**：防止重复处理同一支付事件
- **备用机制**：Webhook 失败时自动验证支付状态

### 客服支持
如有支付相关问题，请联系：oneone.games111@gmail.com