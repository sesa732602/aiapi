-- API接口及文档相关表结构设计

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
