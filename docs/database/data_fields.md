# API服务平台数据字段设计

## 1. 用户模块数据字段

### 用户表 (users)
- `id`: 整型，自增主键
- `username`: 字符串，用户名，唯一
- `email`: 字符串，邮箱，唯一
- `phone`: 字符串，手机号，唯一，可为空
- `password_hash`: 字符串，密码哈希
- `salt`: 字符串，密码盐
- `avatar`: 字符串，头像URL，可为空
- `status`: 枚举，用户状态（活跃/禁用/未验证）
- `user_type`: 枚举，用户类型（普通/企业/管理员）
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间
- `last_login`: 时间戳，最后登录时间

### 第三方认证表 (oauth_accounts)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `provider`: 字符串，提供商（微信/Google等）
- `provider_user_id`: 字符串，第三方用户ID
- `access_token`: 字符串，访问令牌
- `refresh_token`: 字符串，刷新令牌，可为空
- `expires_at`: 时间戳，令牌过期时间
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 用户验证表 (user_verifications)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `type`: 枚举，验证类型（邮箱/手机）
- `code`: 字符串，验证码
- `expires_at`: 时间戳，过期时间
- `verified`: 布尔值，是否已验证
- `created_at`: 时间戳，创建时间

## 2. API接口模块数据字段

### API接口表 (apis)
- `id`: 整型，自增主键
- `name`: 字符串，API名称，唯一
- `description`: 文本，API描述
- `endpoint`: 字符串，API端点路径
- `target_url`: 字符串，目标URL（内部服务地址）
- `method`: 枚举，HTTP方法（GET/POST等）
- `version`: 字符串，API版本
- `status`: 枚举，状态（活跃/禁用/测试）
- `is_public`: 布尔值，是否公开
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### API参数表 (api_parameters)
- `id`: 整型，自增主键
- `api_id`: 整型，外键关联apis表
- `name`: 字符串，参数名称
- `description`: 文本，参数描述
- `type`: 字符串，参数类型（string/number等）
- `required`: 布尔值，是否必需
- `default_value`: 字符串，默认值，可为空
- `example`: 字符串，示例值
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### API响应表 (api_responses)
- `id`: 整型，自增主键
- `api_id`: 整型，外键关联apis表
- `status_code`: 整型，HTTP状态码
- `description`: 文本，响应描述
- `schema`: JSON，响应结构模式
- `example`: JSON，示例响应
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### API文档表 (api_docs)
- `id`: 整型，自增主键
- `api_id`: 整型，外键关联apis表
- `content`: 文本，文档内容（Markdown格式）
- `language`: 字符串，文档语言（zh-CN/en-US等）
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### SDK示例表 (sdk_examples)
- `id`: 整型，自增主键
- `api_id`: 整型，外键关联apis表
- `language`: 字符串，编程语言（Python/JavaScript等）
- `code`: 文本，示例代码
- `description`: 文本，示例描述
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

## 3. 鉴权模块数据字段

### API密钥表 (api_keys)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `key`: 字符串，API密钥，唯一
- `secret`: 字符串，API密钥密文
- `name`: 字符串，密钥名称
- `status`: 枚举，状态（活跃/禁用/过期）
- `expires_at`: 时间戳，过期时间，可为空
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间
- `last_used_at`: 时间戳，最后使用时间

### 权限表 (permissions)
- `id`: 整型，自增主键
- `name`: 字符串，权限名称，唯一
- `description`: 文本，权限描述
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 用户权限表 (user_permissions)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `permission_id`: 整型，外键关联permissions表
- `created_at`: 时间戳，创建时间

### 速率限制表 (rate_limits)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表，可为空
- `api_id`: 整型，外键关联apis表，可为空
- `api_key_id`: 整型，外键关联api_keys表，可为空
- `limit_type`: 枚举，限制类型（每秒/每分钟/每小时/每天）
- `limit_value`: 整型，限制值
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### IP白名单表 (ip_whitelist)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `ip_address`: 字符串，IP地址
- `description`: 文本，描述，可为空
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

## 4. API代理与网关模块数据字段

### 代理配置表 (proxy_configs)
- `id`: 整型，自增主键
- `api_id`: 整型，外键关联apis表
- `public_path`: 字符串，公开路径
- `target_path`: 字符串，目标路径
- `rewrite_rules`: JSON，路径重写规则
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 自定义域名表 (custom_domains)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `domain`: 字符串，域名，唯一
- `ssl_status`: 枚举，SSL状态（无/待配置/已配置）
- `verification_status`: 枚举，验证状态（未验证/已验证）
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 请求日志表 (request_logs)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `api_id`: 整型，外键关联apis表
- `api_key_id`: 整型，外键关联api_keys表，可为空
- `ip_address`: 字符串，请求IP
- `request_time`: 时间戳，请求时间
- `method`: 字符串，HTTP方法
- `path`: 字符串，请求路径
- `query_params`: JSON，查询参数
- `headers`: JSON，请求头
- `body`: JSON，请求体，可为空
- `response_status`: 整型，响应状态码
- `response_time`: 整型，响应时间（毫秒）
- `error`: 文本，错误信息，可为空
- `log_file_path`: 字符串，日志文件路径

## 5. 套餐与计费模块数据字段

### 套餐表 (plans)
- `id`: 整型，自增主键
- `name`: 字符串，套餐名称
- `description`: 文本，套餐描述
- `price`: 小数，价格
- `currency`: 字符串，货币（CNY/USD等）
- `billing_cycle`: 枚举，计费周期（一次性/月/年）
- `duration`: 整型，持续时间（月数）
- `is_active`: 布尔值，是否活跃
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 套餐特性表 (plan_features)
- `id`: 整型，自增主键
- `plan_id`: 整型，外键关联plans表
- `feature_name`: 字符串，特性名称
- `feature_value`: 字符串，特性值
- `feature_type`: 枚举，特性类型（文本/数值/布尔）
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 套餐API关联表 (plan_apis)
- `id`: 整型，自增主键
- `plan_id`: 整型，外键关联plans表
- `api_id`: 整型，外键关联apis表
- `quota`: 整型，配额（调用次数）
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 用户套餐表 (user_plans)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `plan_id`: 整型，外键关联plans表
- `start_date`: 时间戳，开始日期
- `end_date`: 时间戳，结束日期
- `status`: 枚举，状态（活跃/过期/取消）
- `auto_renew`: 布尔值，是否自动续费
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 用户API配额表 (user_api_quotas)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `api_id`: 整型，外键关联apis表
- `total_quota`: 整型，总配额
- `used_quota`: 整型，已使用配额
- `reset_date`: 时间戳，重置日期
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

## 6. 订单与支付模块数据字段

### 订单表 (orders)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `plan_id`: 整型，外键关联plans表
- `order_number`: 字符串，订单号，唯一
- `amount`: 小数，金额
- `currency`: 字符串，货币（CNY/USD等）
- `status`: 枚举，状态（待支付/已支付/已取消/已退款）
- `payment_method`: 字符串，支付方式
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间
- `paid_at`: 时间戳，支付时间，可为空

### 支付记录表 (payments)
- `id`: 整型，自增主键
- `order_id`: 整型，外键关联orders表
- `transaction_id`: 字符串，交易ID，唯一
- `amount`: 小数，金额
- `currency`: 字符串，货币（CNY/USD等）
- `payment_method`: 字符串，支付方式
- `payment_gateway`: 字符串，支付网关
- `status`: 枚举，状态（成功/失败/处理中）
- `gateway_response`: JSON，网关响应
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 用户余额表 (user_balances)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `balance`: 小数，余额
- `currency`: 字符串，货币（CNY/USD等）
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 余额交易表 (balance_transactions)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `amount`: 小数，金额
- `currency`: 字符串，货币（CNY/USD等）
- `type`: 枚举，类型（充值/消费/退款）
- `description`: 文本，描述
- `reference_id`: 字符串，关联ID（订单ID或其他）
- `reference_type`: 字符串，关联类型（order/api_usage等）
- `created_at`: 时间戳，创建时间

## 7. 账单模块数据字段

### 账单表 (invoices)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `invoice_number`: 字符串，账单号，唯一
- `amount`: 小数，金额
- `currency`: 字符串，货币（CNY/USD等）
- `status`: 枚举，状态（未付/已付/部分付款/已取消）
- `due_date`: 时间戳，到期日期
- `issued_date`: 时间戳，开具日期
- `paid_date`: 时间戳，支付日期，可为空
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 账单明细表 (invoice_items)
- `id`: 整型，自增主键
- `invoice_id`: 整型，外键关联invoices表
- `description`: 文本，描述
- `quantity`: 整型，数量
- `unit_price`: 小数，单价
- `amount`: 小数，金额
- `api_id`: 整型，外键关联apis表，可为空
- `created_at`: 时间戳，创建时间

### API使用统计表 (api_usage_stats)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `api_id`: 整型，外键关联apis表
- `date`: 日期，统计日期
- `count`: 整型，调用次数
- `success_count`: 整型，成功次数
- `error_count`: 整型，错误次数
- `total_time`: 整型，总响应时间（毫秒）
- `avg_time`: 小数，平均响应时间（毫秒）
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

## 8. 系统配置模块数据字段

### 系统配置表 (system_configs)
- `id`: 整型，自增主键
- `key`: 字符串，配置键，唯一
- `value`: 文本，配置值
- `description`: 文本，描述
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 通知模板表 (notification_templates)
- `id`: 整型，自增主键
- `name`: 字符串，模板名称，唯一
- `type`: 枚举，类型（邮件/短信/站内信）
- `subject`: 字符串，主题
- `content`: 文本，内容
- `variables`: JSON，变量列表
- `created_at`: 时间戳，创建时间
- `updated_at`: 时间戳，更新时间

### 用户通知表 (user_notifications)
- `id`: 整型，自增主键
- `user_id`: 整型，外键关联users表
- `template_id`: 整型，外键关联notification_templates表
- `content`: 文本，通知内容
- `read`: 布尔值，是否已读
- `sent_at`: 时间戳，发送时间
- `read_at`: 时间戳，阅读时间，可为空
- `created_at`: 时间戳，创建时间
