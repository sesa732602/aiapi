-- 鉴权、权限与速率限制表结构设计

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
