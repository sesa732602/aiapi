/**
 * 移除套餐管理功能，保留套餐购买与订单功能
 * 
 * 此SQL文件包含所有需要在数据库中执行的更改，以支持移除套餐管理功能
 * 注意：此文件不会删除ApiPlan表或已有数据，仅修改权限和关联
 */

-- 1. 创建备份表，保存当前套餐数据
CREATE TABLE IF NOT EXISTS api_plan_backup AS SELECT * FROM api_plan;

-- 2. 移除套餐管理相关的权限记录
-- 注意：此操作会移除所有与套餐管理相关的权限记录，但保留套餐查询权限
DELETE FROM api_permission 
WHERE permission_type = 'ADMIN' 
AND description LIKE '%套餐管理%';

-- 3. 更新用户角色权限，移除套餐管理权限
-- 如果存在角色权限表，请相应调整以下SQL
UPDATE role_permission
SET is_enabled = 0
WHERE permission_code LIKE 'api_plan_manage%'
AND permission_code != 'api_plan_view';

-- 4. 添加触发器防止直接修改套餐表（可选）
-- 此触发器将阻止通过API直接修改套餐表，但允许通过管理员手动修改
DELIMITER //
CREATE TRIGGER IF NOT EXISTS prevent_api_plan_changes
BEFORE UPDATE ON api_plan
FOR EACH ROW
BEGIN
    -- 检查是否通过API调用（可根据实际情况调整判断逻辑）
    IF @source_app = 'api' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = '套餐管理功能已禁用';
    END IF;
END //
DELIMITER ;

-- 5. 添加触发器防止直接删除套餐（可选）
DELIMITER //
CREATE TRIGGER IF NOT EXISTS prevent_api_plan_deletion
BEFORE DELETE ON api_plan
FOR EACH ROW
BEGIN
    -- 检查是否通过API调用（可根据实际情况调整判断逻辑）
    IF @source_app = 'api' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = '套餐管理功能已禁用';
    END IF;
END //
DELIMITER ;

-- 6. 添加触发器防止直接插入套餐（可选）
DELIMITER //
CREATE TRIGGER IF NOT EXISTS prevent_api_plan_insertion
BEFORE INSERT ON api_plan
FOR EACH ROW
BEGIN
    -- 检查是否通过API调用（可根据实际情况调整判断逻辑）
    IF @source_app = 'api' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = '套餐管理功能已禁用';
    END IF;
END //
DELIMITER ;

-- 7. 确保UserQuota表字段正确（修复字段名称）
-- 如果存在字段名不一致的问题，执行以下SQL
ALTER TABLE user_quota 
CHANGE COLUMN IF EXISTS used_calls calls_used INT NOT NULL DEFAULT 0;

-- 8. 添加缺失的字段（如果需要）
ALTER TABLE user_quota 
ADD COLUMN IF NOT EXISTS remaining_calls INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_calls INT NOT NULL DEFAULT 0;

-- 注意：执行此SQL前请先备份数据库
-- 执行方式：mysql -u username -p database_name < this_file.sql
