-- API服务平台完整数据库建表SQL脚本
-- 包含所有模块的表结构和初始化数据

-- 创建数据库
CREATE DATABASE IF NOT EXISTS api_service_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE api_service_platform;

-- =============================================
-- 1. 用户与认证相关表结构
-- =============================================

-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    status ENUM('active', 'disabled', 'unverified') NOT NULL DEFAULT 'unverified',
    user_type ENUM('regular', 'business', 'admin') NOT NULL DEFAULT 'regular',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
);

-- 第三方认证表
CREATE TABLE oauth_accounts (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(100) NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_user (provider, provider_user_id),
    INDEX idx_user_id (user_id)
);

-- 用户验证表
CREATE TABLE user_verifications (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('email', 'phone') NOT NULL,
    code VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- 用户会话表
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- 密码重置表
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- 用户配置表
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    notification_email BOOLEAN NOT NULL DEFAULT TRUE,
    notification_sms BOOLEAN NOT NULL DEFAULT TRUE,
    notification_web BOOLEAN NOT NULL DEFAULT TRUE,
    language VARCHAR(10) NOT NULL DEFAULT 'zh-CN',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Shanghai',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_id (user_id)
);

-- 用户角色表
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 用户-角色关联表
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
);

-- =============================================
-- 2. API接口及文档相关表结构
-- =============================================

-- API接口表
CREATE TABLE apis (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    endpoint VARCHAR(255) NOT NULL,
    target_url VARCHAR(255) NOT NULL,
    method ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS') NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT 'v1',
    status ENUM('active', 'disabled', 'testing') NOT NULL DEFAULT 'testing',
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_status (status),
    INDEX idx_endpoint (endpoint)
);

-- API参数表
CREATE TABLE api_parameters (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    default_value VARCHAR(255),
    example VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_param (api_id, name),
    INDEX idx_api_id (api_id)
);

-- API响应表
CREATE TABLE api_responses (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    status_code INT NOT NULL,
    description TEXT,
    schema JSON,
    example JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_status (api_id, status_code),
    INDEX idx_api_id (api_id)
);

-- API文档表
CREATE TABLE api_docs (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'zh-CN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_lang (api_id, language),
    INDEX idx_api_id (api_id)
);

-- SDK示例表
CREATE TABLE sdk_examples (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    language VARCHAR(30) NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_lang (api_id, language),
    INDEX idx_api_id (api_id)
);

-- API错误码表
CREATE TABLE api_error_codes (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(20) NOT NULL,
    message VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_code (api_id, code),
    INDEX idx_api_id (api_id)
);

-- API版本历史表
CREATE TABLE api_versions (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    version VARCHAR(20) NOT NULL,
    changelog TEXT,
    release_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_of_life_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_version (api_id, version),
    INDEX idx_api_id (api_id)
);

-- API分类表
CREATE TABLE api_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_id BIGINT UNSIGNED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES api_categories(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id)
);

-- API-分类关联表
CREATE TABLE api_category_relations (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES api_categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_category (api_id, category_id),
    INDEX idx_api_id (api_id),
    INDEX idx_category_id (category_id)
);

-- API标签表
CREATE TABLE api_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- API-标签关联表
CREATE TABLE api_tag_relations (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES api_tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_tag (api_id, tag_id),
    INDEX idx_api_id (api_id),
    INDEX idx_tag_id (tag_id)
);

-- =============================================
-- 3. 鉴权、权限与速率限制表结构
-- =============================================

-- API密钥表
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    `key` VARCHAR(64) UNIQUE NOT NULL,
    secret VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    status ENUM('active', 'disabled', 'expired') NOT NULL DEFAULT 'active',
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_key (`key`)
);

-- 权限表
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 用户权限表
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_permission (user_id, permission_id),
    INDEX idx_user_id (user_id),
    INDEX idx_permission_id (permission_id)
);

-- 角色权限表
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
);

-- API权限表
CREATE TABLE api_permissions (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_permission (api_id, permission_id),
    INDEX idx_api_id (api_id),
    INDEX idx_permission_id (permission_id)
);

-- 速率限制表
CREATE TABLE rate_limits (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    api_id BIGINT UNSIGNED,
    api_key_id BIGINT UNSIGNED,
    limit_type ENUM('per_second', 'per_minute', 'per_hour', 'per_day') NOT NULL,
    limit_value INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_api_id (api_id),
    INDEX idx_api_key_id (api_key_id)
);

-- 速率限制计数表（用于实时计数）
CREATE TABLE rate_limit_counters (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    api_id BIGINT UNSIGNED NOT NULL,
    api_key_id BIGINT UNSIGNED,
    counter_key VARCHAR(255) NOT NULL,
    counter_value INT NOT NULL DEFAULT 0,
    reset_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
    UNIQUE KEY unique_counter (user_id, api_id, api_key_id, counter_key),
    INDEX idx_reset_at (reset_at)
);

-- IP白名单表
CREATE TABLE ip_whitelist (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_ip (user_id, ip_address),
    INDEX idx_user_id (user_id)
);

-- IP黑名单表
CREATE TABLE ip_blacklist (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    reason TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ip (ip_address),
    INDEX idx_expires_at (expires_at)
);

-- API访问控制表
CREATE TABLE api_access_controls (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    access_type ENUM('public', 'private', 'restricted') NOT NULL DEFAULT 'private',
    min_user_level ENUM('free', 'basic', 'premium', 'enterprise') NOT NULL DEFAULT 'free',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_api_id (api_id)
);

-- =============================================
-- 4. API代理与网关表结构
-- =============================================

-- 代理配置表
CREATE TABLE proxy_configs (
    id SERIAL PRIMARY KEY,
    api_id BIGINT UNSIGNED NOT NULL,
    public_path VARCHAR(255) NOT NULL,
    target_path VARCHAR(255) NOT NULL,
    rewrite_rules JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_public_path (public_path),
    INDEX idx_api_id (api_id)
);

-- 自定义域名表
CREATE TABLE custom_domains (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    ssl_status ENUM('none', 'pending', 'active') NOT NULL DEFAULT 'none',
    verification_status ENUM('unverified', 'verified') NOT NULL DEFAULT 'unverified',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_verification_status (verification_status)
);

-- 域名验证记录表
CREATE TABLE domain_verifications (
    id SERIAL PRIMARY KEY,
    domain_id BIGINT UNSIGNED NOT NULL,
    verification_type ENUM('dns', 'file') NOT NULL,
    verification_value VARCHAR(255) NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (domain_id) REFERENCES custom_domains(id) ON DELETE CASCADE,
    INDEX idx_domain_id (domain_id),
    INDEX idx_expires_at (expires_at)
);

-- 请求日志元数据表
CREATE TABLE request_logs_meta (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    api_id BIGINT UNSIGNED NOT NULL,
    api_key_id BIGINT UNSIGNED,
    ip_address VARCHAR(45) NOT NULL,
    request_time TIMESTAMP NOT NULL,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(255) NOT NULL,
    query_params JSON,
    headers JSON,
    body JSON,
    response_status INT NOT NULL,
    response_time INT NOT NULL COMMENT '响应时间（毫秒）',
    error TEXT,
    log_file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_api_id (api_id),
    INDEX idx_request_time (request_time),
    INDEX idx_response_status (response_status)
);

-- 日志存储配置表
CREATE TABLE log_storage_configs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    storage_type ENUM('local', 's3', 'oss') NOT NULL DEFAULT 'local',
    retention_days INT NOT NULL DEFAULT 30,
    max_size_mb INT NOT NULL DEFAULT 1000,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_id (user_id)
);

-- 日志下载记录表
CREATE TABLE log_downloads (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    download_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_download_time (download_time)
);

-- 网关节点表
CREATE TABLE gateway_nodes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INT NOT NULL,
    status ENUM('online', 'offline', 'maintenance') NOT NULL DEFAULT 'online',
    health_check_url VARCHAR(255) NOT NULL,
    last_health_check TIMESTAMP,
    health_status ENUM('healthy', 'unhealthy') NOT NULL DEFAULT 'healthy',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_host_port (host, port)
);

-- 流量统计表（按天）
CREATE TABLE traffic_stats_daily (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    api_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    requests_count INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    error_count INT NOT NULL DEFAULT 0,
    total_response_time BIGINT NOT NULL DEFAULT 0,
    avg_response_time FLOAT GENERATED ALWAYS AS (IF(requests_count > 0, total_response_time / requests_count, 0)) STORED,
    bandwidth_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_api_date (user_id, api_id, date),
    INDEX idx_date (date)
);

-- 流量统计表（按月）
CREATE TABLE traffic_stats_monthly (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    api_id BIGINT UNSIGNED NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    requests_count INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    error_count INT NOT NULL DEFAULT 0,
    total_response_time BIGINT NOT NULL DEFAULT 0,
    avg_response_time FLOAT GENERATED ALWAYS AS (IF(requests_count > 0, total_response_time / requests_count, 0)) STORED,
    bandwidth_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_api_year_month (user_id, api_id, year, month),
    INDEX idx_year_month (year, month)
);

-- =============================================
-- 5. 套餐、计费与订单表结构
-- =============================================

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

-- =============================================
-- 6. 支付与账单表结构
-- =============================================

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

-- =============================================
-- 7. 初始化数据
-- =============================================

-- 初始化角色数据
INSERT INTO roles (name, description) VALUES 
('admin', '系统管理员，拥有所有权限'),
('business', '企业用户，拥有高级API使用权限'),
('regular', '普通用户，拥有基本API使用权限');

-- 初始化API数据
INSERT INTO apis (name, description, endpoint, target_url, method, status, is_public) VALUES 
('图片文字识别', '识别图片中的文字内容', '/api/ocr', 'http://127.0.0.1:3005/api/ocr', 'POST', 'active', TRUE),
('语音识别', '将语音转换为文本', '/api/audio2text', 'http://127.0.0.1:3006/api/audit2text', 'POST', 'active', TRUE),
('语音合成', '将文本转换为语音', '/api/text2audio', 'http://127.0.0.1:3007/api/text2audit', 'POST', 'active', TRUE),
('MD5解密', '解密MD5哈希值', '/api/md5decrypt', 'http://127.0.0.1:3002/api/pmd5', 'POST', 'active', TRUE);

-- 初始化API分类
INSERT INTO api_categories (name, description) VALUES 
('图像处理', '图像识别与处理相关API'),
('语音处理', '语音识别与合成相关API'),
('安全工具', '加解密与安全相关API');

-- 关联API与分类
INSERT INTO api_category_relations (api_id, category_id) VALUES 
(1, 1), -- 图片文字识别 -> 图像处理
(2, 2), -- 语音识别 -> 语音处理
(3, 2), -- 语音合成 -> 语音处理
(4, 3); -- MD5解密 -> 安全工具

-- 初始化权限数据
INSERT INTO permissions (name, description) VALUES 
('api.read', '查看API信息'),
('api.execute', '执行API调用'),
('api.manage', '管理API设置'),
('user.read', '查看用户信息'),
('user.manage', '管理用户'),
('billing.read', '查看账单信息'),
('billing.manage', '管理账单'),
('admin.access', '访问管理后台');

-- 初始化角色权限
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), -- 管理员拥有所有权限
(2, 1), (2, 2), (2, 4), (2, 6), -- 企业用户拥有API执行、查看用户和账单权限
(3, 1), (3, 2), (3, 4), (3, 6); -- 普通用户拥有API执行、查看用户和账单权限

-- 初始化API访问控制
INSERT INTO api_access_controls (api_id, access_type, min_user_level) VALUES 
(1, 'public', 'free'),    -- 图片文字识别：公开，免费用户可用
(2, 'restricted', 'basic'), -- 语音识别：受限，基础用户可用
(3, 'restricted', 'basic'), -- 语音合成：受限，基础用户可用
(4, 'private', 'premium');  -- MD5解密：私有，高级用户可用

-- 初始化代理配置
INSERT INTO proxy_configs (api_id, public_path, target_path) VALUES 
(1, '/opensapi/ocr', '/api/ocr'),
(2, '/opensapi/audio2text', '/api/audit2text'),
(3, '/opensapi/text2audio', '/api/text2audit'),
(4, '/opensapi/md5decrypt', '/api/pmd5');

-- 初始化网关节点
INSERT INTO gateway_nodes (name, host, port, health_check_url) VALUES 
('主节点', 'localhost', 8000, 'http://localhost:8000/health'),
('备用节点', 'localhost', 8001, 'http://localhost:8001/health');

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

-- 初始化支付网关
INSERT INTO payment_gateways (name, gateway_code, config, is_active) VALUES 
('支付宝', 'alipay', '{"app_id": "2021000000000000", "merchant_private_key": "PRIVATE_KEY_PLACEHOLDER", "alipay_public_key": "PUBLIC_KEY_PLACEHOLDER", "notify_url": "https://api.yourdomain.com/payments/alipay/notify"}', TRUE),
('微信支付', 'wechat', '{"app_id": "wx1234567890", "mch_id": "1900000000", "key": "KEY_PLACEHOLDER", "notify_url": "https://api.yourdomain.com/payments/wechat/notify"}', TRUE),
('PayPal', 'paypal', '{"client_id": "CLIENT_ID_PLACEHOLDER", "client_secret": "CLIENT_SECRET_PLACEHOLDER", "mode": "sandbox"}', TRUE),
('Stripe', 'stripe', '{"api_key": "sk_test_PLACEHOLDER", "public_key": "pk_test_PLACEHOLDER"}', TRUE);
