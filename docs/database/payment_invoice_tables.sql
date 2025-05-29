-- 支付与账单明细表结构设计

-- 支付记录表
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL,
    status ENUM('success', 'failed', 'pending') NOT NULL DEFAULT 'pending',
    gateway_response JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 用户余额表
CREATE TABLE user_balances (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_currency (user_id, currency),
    INDEX idx_user_id (user_id)
);

-- 余额交易表
CREATE TABLE balance_transactions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    type ENUM('deposit', 'consumption', 'refund') NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_reference (reference_type, reference_id)
);

-- 账单表
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    status ENUM('unpaid', 'paid', 'partially_paid', 'cancelled') NOT NULL DEFAULT 'unpaid',
    due_date TIMESTAMP NOT NULL,
    issued_date TIMESTAMP NOT NULL,
    paid_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_issued_date (issued_date)
);

-- 账单明细表
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id BIGINT UNSIGNED NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 4) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    api_id BIGINT UNSIGNED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE SET NULL,
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_api_id (api_id)
);

-- API使用统计表（按日）
CREATE TABLE api_usage_stats_daily (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    api_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    count INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    error_count INT NOT NULL DEFAULT 0,
    total_time BIGINT NOT NULL DEFAULT 0 COMMENT '总响应时间（毫秒）',
    avg_time FLOAT GENERATED ALWAYS AS (IF(count > 0, total_time / count, 0)) STORED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_api_date (user_id, api_id, date),
    INDEX idx_date (date)
);

-- API使用统计表（按月）
CREATE TABLE api_usage_stats_monthly (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    api_id BIGINT UNSIGNED NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    count INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    error_count INT NOT NULL DEFAULT 0,
    total_time BIGINT NOT NULL DEFAULT 0 COMMENT '总响应时间（毫秒）',
    avg_time FLOAT GENERATED ALWAYS AS (IF(count > 0, total_time / count, 0)) STORED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_api_year_month (user_id, api_id, year, month),
    INDEX idx_year_month (year, month)
);

-- 计费记录表
CREATE TABLE billing_records (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    api_id BIGINT UNSIGNED NOT NULL,
    usage_count INT NOT NULL,
    unit_price DECIMAL(10, 6) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    billing_date DATE NOT NULL,
    invoice_id BIGINT UNSIGNED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_api_id (api_id),
    INDEX idx_billing_date (billing_date),
    INDEX idx_invoice_id (invoice_id)
);

-- 支付网关配置表
CREATE TABLE payment_gateways (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    gateway_code VARCHAR(50) UNIQUE NOT NULL,
    config JSON NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_gateway_code (gateway_code),
    INDEX idx_is_active (is_active)
);

-- 退款记录表
CREATE TABLE refunds (
    id SERIAL PRIMARY KEY,
    payment_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    reason TEXT,
    status ENUM('pending', 'processed', 'failed') NOT NULL DEFAULT 'pending',
    refund_transaction_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_id (payment_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 发票信息表
CREATE TABLE invoice_info (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('personal', 'company') NOT NULL DEFAULT 'personal',
    title VARCHAR(100) NOT NULL,
    tax_number VARCHAR(50),
    address VARCHAR(255),
    bank VARCHAR(100),
    bank_account VARCHAR(50),
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
);

-- 初始化支付网关
INSERT INTO payment_gateways (name, gateway_code, config, is_active) VALUES 
('支付宝', 'alipay', '{"app_id": "2021000000000000", "merchant_private_key": "PRIVATE_KEY_PLACEHOLDER", "alipay_public_key": "PUBLIC_KEY_PLACEHOLDER", "notify_url": "https://api.yourdomain.com/payments/alipay/notify"}', TRUE),
('微信支付', 'wechat', '{"app_id": "wx1234567890", "mch_id": "1900000000", "key": "KEY_PLACEHOLDER", "notify_url": "https://api.yourdomain.com/payments/wechat/notify"}', TRUE),
('PayPal', 'paypal', '{"client_id": "CLIENT_ID_PLACEHOLDER", "client_secret": "CLIENT_SECRET_PLACEHOLDER", "mode": "sandbox"}', TRUE),
('Stripe', 'stripe', '{"api_key": "sk_test_PLACEHOLDER", "public_key": "pk_test_PLACEHOLDER"}', TRUE);
