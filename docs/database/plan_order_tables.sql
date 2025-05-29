-- 套餐、计费与订单相关表结构设计

-- 套餐表
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    billing_cycle ENUM('one_time', 'monthly', 'yearly') NOT NULL,
    duration INT NOT NULL COMMENT '持续时间（月数）',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active)
);

-- 套餐特性表
CREATE TABLE plan_features (
    id SERIAL PRIMARY KEY,
    plan_id BIGINT UNSIGNED NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    feature_value VARCHAR(255) NOT NULL,
    feature_type ENUM('text', 'number', 'boolean') NOT NULL DEFAULT 'text',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    INDEX idx_plan_id (plan_id)
);

-- 套餐API关联表
CREATE TABLE plan_apis (
    id SERIAL PRIMARY KEY,
    plan_id BIGINT UNSIGNED NOT NULL,
    api_id BIGINT UNSIGNED NOT NULL,
    quota INT NOT NULL COMMENT '调用次数配额',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_plan_api (plan_id, api_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_api_id (api_id)
);

-- 用户套餐表
CREATE TABLE user_plans (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    plan_id BIGINT UNSIGNED NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
);

-- 用户API配额表
CREATE TABLE user_api_quotas (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    api_id BIGINT UNSIGNED NOT NULL,
    total_quota INT NOT NULL,
    used_quota INT NOT NULL DEFAULT 0,
    reset_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_api (user_id, api_id),
    INDEX idx_user_id (user_id),
    INDEX idx_api_id (api_id),
    INDEX idx_reset_date (reset_date)
);

-- 订单表
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    plan_id BIGINT UNSIGNED NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    status ENUM('pending', 'paid', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 订单项目表
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    item_type ENUM('plan', 'api_quota', 'feature') NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_item_type_id (item_type, item_id)
);

-- 优惠券表
CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('percentage', 'fixed_amount') NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    usage_limit INT,
    usage_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active),
    INDEX idx_date_range (start_date, end_date)
);

-- 订单优惠券关联表
CREATE TABLE order_coupons (
    id SERIAL PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    coupon_id BIGINT UNSIGNED NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_order_coupon (order_id, coupon_id),
    INDEX idx_order_id (order_id),
    INDEX idx_coupon_id (coupon_id)
);

-- 价格策略表
CREATE TABLE pricing_strategies (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    strategy_type ENUM('per_call', 'tiered', 'subscription') NOT NULL,
    base_price DECIMAL(10, 6) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_id (api_id),
    INDEX idx_is_active (is_active)
);

-- 阶梯价格表
CREATE TABLE tiered_pricing (
    id SERIAL PRIMARY KEY,
    strategy_id BIGINT UNSIGNED NOT NULL,
    min_calls INT NOT NULL,
    max_calls INT,
    price_per_call DECIMAL(10, 6) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES pricing_strategies(id) ON DELETE CASCADE,
    INDEX idx_strategy_id (strategy_id),
    INDEX idx_min_calls (min_calls)
);

-- 初始化套餐数据
INSERT INTO plans (name, description, price, currency, billing_cycle, duration, is_active) VALUES 
('免费试用', '新用户免费试用套餐，包含有限的API调用次数', 0.00, 'CNY', 'one_time', 1, TRUE),
('基础套餐', '适合个人开发者的基础套餐，包含适量API调用次数', 99.00, 'CNY', 'monthly', 1, TRUE),
('专业套餐', '适合小型团队的专业套餐，包含大量API调用次数', 299.00, 'CNY', 'monthly', 1, TRUE),
('企业套餐', '适合企业用户的高级套餐，包含无限API调用次数', 999.00, 'CNY', 'monthly', 1, TRUE),
('年度企业套餐', '企业用户年付优惠套餐', 9990.00, 'CNY', 'yearly', 12, TRUE);

-- 初始化套餐特性
INSERT INTO plan_features (plan_id, feature_name, feature_value, feature_type) VALUES 
(1, '有效期', '30天', 'text'),
(1, '技术支持', '邮件支持', 'text'),
(1, '并发请求数', '5', 'number'),
(2, '有效期', '30天', 'text'),
(2, '技术支持', '邮件支持+工单', 'text'),
(2, '并发请求数', '20', 'number'),
(3, '有效期', '30天', 'text'),
(3, '技术支持', '邮件+工单+在线客服', 'text'),
(3, '并发请求数', '50', 'number'),
(4, '有效期', '30天', 'text'),
(4, '技术支持', '全渠道7*24小时支持', 'text'),
(4, '并发请求数', '100', 'number'),
(5, '有效期', '365天', 'text'),
(5, '技术支持', '全渠道7*24小时支持+专属客户经理', 'text'),
(5, '并发请求数', '200', 'number');

-- 初始化套餐API关联
INSERT INTO plan_apis (plan_id, api_id, quota) VALUES 
(1, 1, 100),   -- 免费套餐：图片文字识别100次
(1, 2, 50),    -- 免费套餐：语音识别50次
(1, 3, 50),    -- 免费套餐：语音合成50次
(1, 4, 0),     -- 免费套餐：MD5解密0次（不可用）
(2, 1, 5000),  -- 基础套餐：图片文字识别5000次
(2, 2, 2000),  -- 基础套餐：语音识别2000次
(2, 3, 2000),  -- 基础套餐：语音合成2000次
(2, 4, 1000),  -- 基础套餐：MD5解密1000次
(3, 1, 20000), -- 专业套餐：图片文字识别20000次
(3, 2, 10000), -- 专业套餐：语音识别10000次
(3, 3, 10000), -- 专业套餐：语音合成10000次
(3, 4, 5000),  -- 专业套餐：MD5解密5000次
(4, 1, 100000), -- 企业套餐：图片文字识别100000次
(4, 2, 50000),  -- 企业套餐：语音识别50000次
(4, 3, 50000),  -- 企业套餐：语音合成50000次
(4, 4, 20000),  -- 企业套餐：MD5解密20000次
(5, 1, 1200000), -- 年度企业套餐：图片文字识别1200000次
(5, 2, 600000),  -- 年度企业套餐：语音识别600000次
(5, 3, 600000),  -- 年度企业套餐：语音合成600000次
(5, 4, 240000);  -- 年度企业套餐：MD5解密240000次

-- 初始化价格策略
INSERT INTO pricing_strategies (api_id, strategy_type, base_price, currency) VALUES 
(1, 'per_call', 0.01, 'CNY'),  -- 图片文字识别：每次0.01元
(2, 'per_call', 0.02, 'CNY'),  -- 语音识别：每次0.02元
(3, 'per_call', 0.02, 'CNY'),  -- 语音合成：每次0.02元
(4, 'per_call', 0.05, 'CNY');  -- MD5解密：每次0.05元

-- 初始化阶梯价格
INSERT INTO tiered_pricing (strategy_id, min_calls, max_calls, price_per_call) VALUES 
(1, 1, 10000, 0.01),           -- 图片文字识别：1-10000次，每次0.01元
(1, 10001, 100000, 0.008),     -- 图片文字识别：10001-100000次，每次0.008元
(1, 100001, NULL, 0.005),      -- 图片文字识别：100001次以上，每次0.005元
(2, 1, 5000, 0.02),            -- 语音识别：1-5000次，每次0.02元
(2, 5001, 50000, 0.015),       -- 语音识别：5001-50000次，每次0.015元
(2, 50001, NULL, 0.01),        -- 语音识别：50001次以上，每次0.01元
(3, 1, 5000, 0.02),            -- 语音合成：1-5000次，每次0.02元
(3, 5001, 50000, 0.015),       -- 语音合成：5001-50000次，每次0.015元
(3, 50001, NULL, 0.01),        -- 语音合成：50001次以上，每次0.01元
(4, 1, 1000, 0.05),            -- MD5解密：1-1000次，每次0.05元
(4, 1001, 10000, 0.04),        -- MD5解密：1001-10000次，每次0.04元
(4, 10001, NULL, 0.03);        -- MD5解密：10001次以上，每次0.03元
