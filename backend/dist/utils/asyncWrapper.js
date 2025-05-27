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
exports.asyncWrapper = void 0;
/**
 * 包装异步控制器方法，统一处理错误
 * @param fn 异步控制器函数
 */
const asyncWrapper = (fn) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fn(req, res, next);
        }
        catch (error) {
            // eslint-disable-next-line no-undef
            console.error('异步操作错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误',
                // eslint-disable-next-line no-undef
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    });
};
exports.asyncWrapper = asyncWrapper;
