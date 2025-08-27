# app.oneone.games

## 背景
- Homepage (www.oneone.games)：静态页面，做营销与入口。
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

## Vercel 部署规范

### 环境差异问题
本地开发环境和 Vercel 线上构建环境存在差异，必须遵循以下规范：

#### 1. Google Fonts 使用规范
**问题**: 本地可以访问 Google Fonts，但 Vercel 构建时可能网络超时
**解决方案**: 
- ❌ 避免使用 `next/font/google` 的在线字体
- ✅ 使用系统默认字体或本地字体文件
- ✅ 在 `layout.tsx` 中使用 `font-sans` 类名

```typescript
// ❌ 避免这样做
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

// ✅ 推荐这样做
<body className="font-sans">
```

#### 2. Stripe API 版本规范
**问题**: Stripe 定期更新 API 版本，本地和线上版本不一致
**解决方案**:
- ✅ 始终使用最新的稳定 API 版本
- ✅ 定期检查并更新所有 Stripe 相关文件
- ✅ 当前版本：`2025-07-30.basil`

```typescript
// ✅ 正确的 API 版本配置
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})
```

#### 3. TypeScript 类型兼容性
**问题**: Stripe API 版本更新后类型定义变化
**解决方案**:
- ✅ 使用类型断言处理兼容性问题
- ✅ 对可能变化的属性使用 `(object as any).property`

```typescript
// ✅ 处理类型兼容性
current_period_end: (subscription as any).current_period_end 
  ? new Date((subscription as any).current_period_end * 1000).toISOString() 
  : null,
```

#### 4. useSearchParams() Suspense 边界
**问题**: Next.js 15 要求 `useSearchParams()` 必须包装在 Suspense 边界中
**解决方案**:
- ✅ 所有使用 `useSearchParams()` 的页面必须包装在 Suspense 中
- ✅ 创建包装组件处理 Suspense 边界

```typescript
// ✅ 正确的 Suspense 包装
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  )
}

function PageContent() {
  const searchParams = useSearchParams()
  // 组件逻辑
}
```

#### 5. 测试文件管理
**问题**: 测试页面在线上环境不需要，可能导致构建问题
**解决方案**:
- ✅ 完成功能测试后及时删除测试页面
- ✅ 测试页面放在独立目录，便于批量删除
- ✅ 避免在测试页面中使用生产环境不支持的代码

### 部署前检查清单
在推送到 GitHub 触发 Vercel 部署前，必须完成以下检查：

#### 代码检查
- [ ] 运行 `npm run build` 确保本地构建成功
- [ ] 检查所有 TypeScript 类型错误
- [ ] 验证 ESLint 规则通过
- [ ] 确认没有使用 Google Fonts 在线字体
- [ ] 验证 Stripe API 版本一致

#### 环境变量检查
- [ ] 确认 Vercel 环境变量已配置
- [ ] 验证 Stripe Webhook 端点正确
- [ ] 检查 Supabase 连接配置

#### 功能测试
- [ ] 本地测试登录/注册流程
- [ ] 验证支付流程正常工作
- [ ] 测试中间件保护逻辑
- [ ] 确认会员状态更新正常

### 常见部署问题及解决方案

#### 构建失败：Google Fonts 超时
```bash
# 错误信息
Failed to fetch `Inter` from Google Fonts.
```
**解决方案**: 移除 `next/font/google` 导入，使用系统字体

#### 构建失败：Stripe API 版本不匹配
```bash
# 错误信息
Type '"2024-12-18.acacia"' is not assignable to type '"2025-07-30.basil"'
```
**解决方案**: 更新所有 Stripe 文件到最新 API 版本

#### 构建失败：useSearchParams() 缺少 Suspense
```bash
# 错误信息
useSearchParams() should be wrapped in a suspense boundary
```
**解决方案**: 为使用 `useSearchParams()` 的页面添加 Suspense 包装

#### 运行时错误：TypeScript 类型错误
```bash
# 错误信息
Property 'current_period_end' does not exist on type 'Subscription'
```
**解决方案**: 使用类型断言 `(subscription as any).current_period_end`

### 部署最佳实践
1. **本地构建测试**: 每次提交前运行 `npm run build`
2. **渐进式部署**: 小批量提交，避免大规模变更
3. **环境一致性**: 确保本地和线上环境配置一致
4. **监控部署**: 关注 Vercel 部署日志，及时发现问题
5. **回滚准备**: 保留可回滚的版本，应对紧急问题

### 部署问题复盘（v0.4.0 经验总结）

#### 问题背景
在 v0.4.0 版本部署到 Vercel 时遇到了一系列构建失败问题，这些问题在本地开发环境中没有出现，但在 Vercel 的构建环境中暴露出来。

#### 问题链分析
1. **根本原因**: 本地开发环境和 Vercel 构建环境存在差异
2. **触发因素**: 代码中使用了本地环境支持但线上环境不支持的特性
3. **连锁反应**: 一个问题修复后，下一个问题暴露，形成问题链

#### 具体问题及解决方案

##### 问题 1: Google Fonts 连接超时
- **现象**: `Failed to fetch 'Inter' from Google Fonts`
- **原因**: Vercel 构建时网络环境与本地不同，无法访问 Google Fonts
- **解决**: 移除 `next/font/google` 依赖，使用系统默认字体

##### 问题 2: Stripe API 版本不匹配
- **现象**: `Type '"2024-12-18.acacia"' is not assignable to type '"2025-07-30.basil"'`
- **原因**: Stripe 定期更新 API 版本，本地和线上版本不一致
- **解决**: 更新所有 Stripe 相关文件到最新 API 版本

##### 问题 3: TypeScript 类型错误
- **现象**: `Property 'current_period_end' does not exist on type 'Subscription'`
- **原因**: Stripe API 版本更新后，类型定义发生变化
- **解决**: 使用类型断言 `(subscription as any).current_period_end`

##### 问题 4: useSearchParams() Suspense 边界
- **现象**: `useSearchParams() should be wrapped in a suspense boundary`
- **原因**: Next.js 15 对 `useSearchParams()` 使用有严格要求
- **解决**: 为所有使用 `useSearchParams()` 的页面添加 Suspense 包装

##### 问题 5: 测试文件残留
- **现象**: 测试页面包含过时代码导致构建问题
- **原因**: M1、M2 的测试页面在 M3 完成后不再需要
- **解决**: 删除过时的测试页面

#### 经验教训
1. **环境差异意识**: 始终考虑本地和线上环境的差异
2. **渐进式修复**: 一个问题一个问题地修复，避免同时修改多个地方
3. **本地构建验证**: 每次修复后都要在本地运行 `npm run build` 验证
4. **依赖版本管理**: 定期检查和更新第三方依赖的版本
5. **代码清理**: 及时清理不再需要的测试文件和过时代码

#### 预防措施
1. **建立部署检查清单**: 每次部署前必须完成所有检查项
2. **环境一致性测试**: 定期验证本地和线上环境的一致性
3. **依赖版本锁定**: 使用 package-lock.json 锁定依赖版本
4. **代码审查**: 重点关注可能影响构建的代码变更
5. **监控和告警**: 设置部署失败的通知机制

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
- ✅ M3：middleware 保护 /games/premium/*；示例 premium 游戏入口页
  - ✅ 实现中间件保护付费游戏路由
  - ✅ 动态付费游戏页面 `/games/premium/[slug]`
  - ✅ 会员专享示例页 `/games/premium/demo`
  - ✅ 完整的访问控制逻辑（登录检查 + 会员验证）
  - ✅ 支持外部游戏链接（如 Fishy Game）
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
- M2 完善 → v0.3.1
- M3 → v0.4.0
- M4 → v0.5.0

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
- 中间件正确保护付费游戏路由，未授权访问被重定向
- 会员可以正常访问付费游戏页面和外部游戏链接

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

### 付费游戏访问控制
- **路由保护**：`/games/premium/*` 路由受中间件保护
- **访问控制**：
  - 未登录用户 → 重定向到 `/login`
  - 已登录但非会员 → 重定向到 `/billing`
  - 已登录且是会员 → 允许访问
- **游戏页面**：支持动态游戏路由和外部游戏链接
- **示例页面**：`/games/premium/demo` 用于功能验证