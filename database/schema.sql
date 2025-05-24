-- 接口管理平台数据库结构
-- 生成日期: 2025-05-24

-- 创建数据库
CREATE DATABASE IF NOT EXISTS api_management_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE api_management_platform;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','user') NOT NULL DEFAULT 'user',
  `googleId` varchar(255) DEFAULT NULL,
  `wechatId` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 团队表
CREATE TABLE IF NOT EXISTS `team` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdBy` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_cf461f5b40cf1a2b8876011e1e` (`name`),
  KEY `FK_team_user` (`createdBy`),
  CONSTRAINT `FK_team_user` FOREIGN KEY (`createdBy`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 团队成员表
CREATE TABLE IF NOT EXISTS `team_member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teamId` int NOT NULL,
  `userId` int NOT NULL,
  `role` enum('owner','admin','member') NOT NULL DEFAULT 'member',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_team_member_user` (`userId`),
  KEY `FK_team_member_team` (`teamId`),
  CONSTRAINT `FK_team_member_team` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_team_member_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API表
CREATE TABLE IF NOT EXISTS `api` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `path` varchar(255) NOT NULL,
  `method` enum('GET','POST','PUT','DELETE','PATCH') NOT NULL DEFAULT 'GET',
  `teamId` int DEFAULT NULL,
  `createdBy` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_api_name` (`name`),
  KEY `FK_api_team` (`teamId`),
  KEY `FK_api_user` (`createdBy`),
  CONSTRAINT `FK_api_team` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_api_user` FOREIGN KEY (`createdBy`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API版本表
CREATE TABLE IF NOT EXISTS `api_version` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apiId` int NOT NULL,
  `version` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `isCurrent` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_api_version_api` (`apiId`),
  CONSTRAINT `FK_api_version_api` FOREIGN KEY (`apiId`) REFERENCES `api` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API权限表
CREATE TABLE IF NOT EXISTS `api_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apiId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `teamId` int DEFAULT NULL,
  `permissionType` enum('read','write','admin') NOT NULL DEFAULT 'read',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_api_permission_api` (`apiId`),
  KEY `FK_api_permission_user` (`userId`),
  KEY `FK_api_permission_team` (`teamId`),
  CONSTRAINT `FK_api_permission_api` FOREIGN KEY (`apiId`) REFERENCES `api` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_api_permission_team` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_api_permission_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API套餐表
CREATE TABLE IF NOT EXISTS `api_plan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apiId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `callLimit` int NOT NULL,
  `concurrencyLimit` int NOT NULL,
  `validityDays` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_api_plan_api` (`apiId`),
  CONSTRAINT `FK_api_plan_api` FOREIGN KEY (`apiId`) REFERENCES `api` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `apiId` int NOT NULL,
  `planId` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  `callLimit` int NOT NULL,
  `concurrencyLimit` int NOT NULL,
  `validityDays` int NOT NULL,
  `paidAt` datetime DEFAULT NULL,
  `cancelledAt` datetime DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_orders_user` (`userId`),
  KEY `FK_orders_api` (`apiId`),
  KEY `FK_orders_api_plan` (`planId`),
  CONSTRAINT `FK_orders_api` FOREIGN KEY (`apiId`) REFERENCES `api` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_orders_api_plan` FOREIGN KEY (`planId`) REFERENCES `api_plan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_orders_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API调用记录表
CREATE TABLE IF NOT EXISTS `api_call` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `apiId` int NOT NULL,
  `startTime` datetime NOT NULL,
  `responseTime` int NOT NULL,
  `statusCode` int NOT NULL,
  `requestSize` int DEFAULT NULL,
  `responseSize` int DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_api_call_user` (`userId`),
  KEY `FK_api_call_api` (`apiId`),
  KEY `IDX_api_call_created_at` (`createdAt`),
  CONSTRAINT `FK_api_call_api` FOREIGN KEY (`apiId`) REFERENCES `api` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_api_call_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户额度表
CREATE TABLE IF NOT EXISTS `user_quotas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `apiId` int NOT NULL,
  `callLimit` int NOT NULL,
  `callsUsed` int NOT NULL DEFAULT '0',
  `concurrencyLimit` int NOT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_user_quotas_user` (`userId`),
  KEY `FK_user_quotas_api` (`apiId`),
  CONSTRAINT `FK_user_quotas_api` FOREIGN KEY (`apiId`) REFERENCES `api` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_user_quotas_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初始数据：创建超级管理员账号
INSERT INTO `user` (`username`, `email`, `password`, `role`) VALUES
('admin', 'admin@example.com', '$2a$10$eDIJJXXXXXXXXXXXXXXXXeH8YRwM4VPZQzISLT.wPSIXXXXXXXXXXX', 'super_admin');
