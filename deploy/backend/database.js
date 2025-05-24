"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
/**
 * 数据库连接配置
 */
const typeorm_1 = require("typeorm");
const database_1 = require("./config/database");
const User_1 = require("./models/User");
const Team_1 = require("./models/Team");
const TeamMember_1 = require("./models/TeamMember");
const Api_1 = require("./models/Api");
const ApiVersion_1 = require("./models/ApiVersion");
const ApiPermission_1 = require("./models/ApiPermission");
const ApiPlan_1 = require("./models/ApiPlan");
const Order_1 = require("./models/Order");
const ApiCall_1 = require("./models/ApiCall");
const UserQuota_1 = require("./models/UserQuota");
// 创建数据库连接
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: database_1.dbConfig.host,
    port: database_1.dbConfig.port,
    username: database_1.dbConfig.username,
    password: database_1.dbConfig.password,
    database: database_1.dbConfig.database,
    synchronize: database_1.dbConfig.synchronize,
    logging: database_1.dbConfig.logging,
    entities: [
        User_1.User,
        Team_1.Team,
        TeamMember_1.TeamMember,
        Api_1.Api,
        ApiVersion_1.ApiVersion,
        ApiPermission_1.ApiPermission,
        ApiPlan_1.ApiPlan,
        Order_1.Order,
        ApiCall_1.ApiCall,
        UserQuota_1.UserQuota
    ],
    migrations: [],
    subscribers: [],
});
// 初始化数据库连接
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.AppDataSource.initialize();
        console.log('数据库连接已初始化');
        return true;
    }
    catch (error) {
        console.error('数据库连接初始化失败:', error);
        return false;
    }
});
exports.initializeDatabase = initializeDatabase;
