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
 * 数据库连接模块
 */
/* eslint-env node */
const typeorm_1 = require("typeorm");
const database_1 = require("./config/database");
const models_1 = require("./models");
// 创建数据库连接
exports.AppDataSource = new typeorm_1.DataSource(Object.assign(Object.assign({}, (0, database_1.getDbConfig)()), { entities: (0, models_1.registerEntities)(), migrations: [], subscribers: [] }));
// 初始化数据库连接
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.AppDataSource.initialize();
        // eslint-disable-next-line no-undef
        console.log('数据库连接已初始化');
        return true;
    }
    catch (error) {
        // eslint-disable-next-line no-undef
        console.error('数据库连接失败:', error);
        throw error;
    }
});
exports.initializeDatabase = initializeDatabase;
