-- M2 任务：创建支付相关的数据库表（修复版）
-- 在 Supabase 控制台的 SQL Editor 中执行这些语句

-- 1. 创建 profiles 表（用户档案）
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 memberships 表（会员订阅）
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid')) NOT NULL,
    type TEXT CHECK (type IN ('subscription', 'one_time')) NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保每个用户每种类型只有一个活跃订阅
    UNIQUE(user_id, stripe_subscription_id)
);

-- 3. 创建 purchases 表（一次性购买）
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_session_id TEXT UNIQUE NOT NULL,
    stripe_payment_intent_id TEXT,
    amount INTEGER NOT NULL, -- Stripe 金额以分为单位
    currency TEXT DEFAULT 'usd',
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) NOT NULL,
    product_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_stripe_subscription_id ON public.memberships(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session_id ON public.purchases(stripe_session_id);

-- 5. 启用 Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略

-- profiles 表策略：用户只能访问自己的档案
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- memberships 表策略：用户只能访问自己的会员信息
CREATE POLICY "Users can view own memberships" ON public.memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all memberships" ON public.memberships
    FOR ALL USING (auth.role() = 'service_role');

-- purchases 表策略：用户只能访问自己的购买记录
CREATE POLICY "Users can view own purchases" ON public.purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all purchases" ON public.purchases
    FOR ALL USING (auth.role() = 'service_role');

-- 7. 创建触发器函数来自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 为表添加 updated_at 触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. 创建函数来自动创建用户档案
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 为新用户注册创建触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. 创建视图来简化会员状态查询
CREATE OR REPLACE VIEW public.user_membership_status AS
SELECT 
    u.id as user_id,
    u.email,
    m.status as membership_status,
    m.type as membership_type,
    m.current_period_end,
    m.stripe_subscription_id,
    CASE 
        WHEN m.status = 'active' THEN true
        ELSE false
    END as has_active_membership
FROM auth.users u
LEFT JOIN public.memberships m ON u.id = m.user_id 
    AND m.status = 'active'
    AND (m.current_period_end IS NULL OR m.current_period_end > NOW());

-- 12. 为视图启用 RLS（移除这行，因为视图不需要 RLS）
-- ALTER VIEW public.user_membership_status SET (security_invoker = true);

-- 13. 创建视图策略（移除这部分，因为视图不需要策略）
-- CREATE POLICY "Users can view own membership status" ON public.user_membership_status
--     FOR SELECT USING (auth.uid() = user_id);

-- 完成！
-- 执行完成后，数据库将包含：
-- - profiles 表：用户档案信息
-- - memberships 表：会员订阅状态
-- - purchases 表：一次性购买记录
-- - 相应的索引、RLS 策略和触发器
-- - user_membership_status 视图（用于简化查询）
