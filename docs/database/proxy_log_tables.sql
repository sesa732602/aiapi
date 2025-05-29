-- API代理网关与日志表结构设计

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
