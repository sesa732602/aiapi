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
exports.deleteApiPlan = exports.updateApiPlan = exports.getApiPlanById = exports.getApiPlans = exports.createApiPlan = void 0;
const ApiPlan_1 = require("../models/ApiPlan");
const Api_1 = require("../models/Api");
const TeamMember_1 = require("../models/TeamMember");
const ApiPermission_1 = require("../models/ApiPermission");
/**
 * 创建API套餐
 * @param req 请求对象
 * @param res 响应对象
 */
const createApiPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const { apiId, name, description, price, callLimit, concurrencyLimit, validityDays } = req.body;
        const userId = req.user.id;
        // 检查API是否存在
        const apiIdNum = parseInt(apiId, 10);
        const api = yield Api_1.Api.findOne({ where: { id: apiIdNum } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限创建套餐
        if (req.user.role !== 'super_admin' && api.ownerId !== userId) {
            // 检查用户是否是API所属团队的管理员
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    // 检查用户是否有API管理权限
                    const apiPermission = yield ApiPermission_1.ApiPermission.findOne({
                        where: { apiId: apiIdNum, userId, permissionType: ApiPermission_1.PermissionType.ADMIN }
                    });
                    if (!apiPermission) {
                        res.status(403).json({ message: '无权创建API套餐' });
                        return;
                    }
                }
            }
            else {
                // 检查用户是否有API管理权限
                const apiPermission = yield ApiPermission_1.ApiPermission.findOne({
                    where: { apiId: apiIdNum, userId, permissionType: ApiPermission_1.PermissionType.ADMIN }
                });
                if (!apiPermission) {
                    res.status(403).json({ message: '无权创建API套餐' });
                    return;
                }
            }
        }
        // 创建新套餐
        const apiPlan = new ApiPlan_1.ApiPlan();
        apiPlan.apiId = apiIdNum;
        apiPlan.name = name;
        apiPlan.description = description;
        apiPlan.price = price;
        apiPlan.callLimit = callLimit;
        apiPlan.concurrencyLimit = concurrencyLimit;
        apiPlan.validityDays = validityDays;
        yield apiPlan.save();
        res.status(201).json({
            message: 'API套餐创建成功',
            plan: apiPlan
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.createApiPlan = createApiPlan;
/**
 * 获取API套餐列表
 * @param req 请求对象
 * @param res 响应对象
 */
const getApiPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiId = parseInt(req.params.apiId, 10);
        // 检查API是否存在
        const api = yield Api_1.Api.findOne({ where: { id: apiId } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 获取API套餐
        const plans = yield ApiPlan_1.ApiPlan.find({ where: { apiId } });
        res.status(200).json(plans);
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.getApiPlans = getApiPlans;
/**
 * 获取API套餐详情
 * @param req 请求对象
 * @param res 响应对象
 */
const getApiPlanById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        // 检查套餐是否存在
        const plan = yield ApiPlan_1.ApiPlan.findOne({ where: { id } });
        if (!plan) {
            res.status(404).json({ message: 'API套餐不存在' });
            return;
        }
        // 获取API信息
        const api = yield Api_1.Api.findOne({ where: { id: plan.apiId } });
        res.status(200).json(Object.assign(Object.assign({}, plan), { apiName: api === null || api === void 0 ? void 0 : api.name }));
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.getApiPlanById = getApiPlanById;
/**
 * 更新API套餐
 * @param req 请求对象
 * @param res 响应对象
 */
const updateApiPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const id = parseInt(req.params.id, 10);
        const { name, description, price, callLimit, concurrencyLimit, validityDays } = req.body;
        const userId = req.user.id;
        // 检查套餐是否存在
        const plan = yield ApiPlan_1.ApiPlan.findOne({ where: { id } });
        if (!plan) {
            res.status(404).json({ message: 'API套餐不存在' });
            return;
        }
        // 获取API信息
        const api = yield Api_1.Api.findOne({ where: { id: plan.apiId } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限更新套餐
        if (req.user.role !== 'super_admin' && api.ownerId !== userId) {
            // 检查用户是否是API所属团队的管理员
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    // 检查用户是否有API管理权限
                    const apiPermission = yield ApiPermission_1.ApiPermission.findOne({
                        where: { apiId: plan.apiId, userId, permissionType: ApiPermission_1.PermissionType.ADMIN }
                    });
                    if (!apiPermission) {
                        res.status(403).json({ message: '无权更新API套餐' });
                        return;
                    }
                }
            }
            else {
                // 检查用户是否有API管理权限
                const apiPermission = yield ApiPermission_1.ApiPermission.findOne({
                    where: { apiId: plan.apiId, userId, permissionType: ApiPermission_1.PermissionType.ADMIN }
                });
                if (!apiPermission) {
                    res.status(403).json({ message: '无权更新API套餐' });
                    return;
                }
            }
        }
        // 更新套餐信息
        if (name) {
            plan.name = name;
        }
        if (description) {
            plan.description = description;
        }
        if (price) {
            plan.price = price;
        }
        if (callLimit) {
            plan.callLimit = callLimit;
        }
        if (concurrencyLimit) {
            plan.concurrencyLimit = concurrencyLimit;
        }
        if (validityDays) {
            plan.validityDays = validityDays;
        }
        yield plan.save();
        res.status(200).json({
            message: 'API套餐更新成功',
            plan
        });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.updateApiPlan = updateApiPlan;
/**
 * 删除API套餐
 * @param req 请求对象
 * @param res 响应对象
 */
const deleteApiPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: '未授权' });
            return;
        }
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        // 检查套餐是否存在
        const plan = yield ApiPlan_1.ApiPlan.findOne({ where: { id } });
        if (!plan) {
            res.status(404).json({ message: 'API套餐不存在' });
            return;
        }
        // 获取API信息
        const api = yield Api_1.Api.findOne({ where: { id: plan.apiId } });
        if (!api) {
            res.status(404).json({ message: 'API不存在' });
            return;
        }
        // 检查用户是否有权限删除套餐
        if (req.user.role !== 'super_admin' && api.ownerId !== userId) {
            // 检查用户是否是API所属团队的管理员
            if (api.teamId) {
                const teamMember = yield TeamMember_1.TeamMember.findOne({ where: { teamId: api.teamId, userId } });
                if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
                    // 检查用户是否有API管理权限
                    const apiPermission = yield ApiPermission_1.ApiPermission.findOne({
                        where: { apiId: plan.apiId, userId, permissionType: ApiPermission_1.PermissionType.ADMIN }
                    });
                    if (!apiPermission) {
                        res.status(403).json({ message: '无权删除API套餐' });
                        return;
                    }
                }
            }
            else {
                // 检查用户是否有API管理权限
                const apiPermission = yield ApiPermission_1.ApiPermission.findOne({
                    where: { apiId: plan.apiId, userId, permissionType: ApiPermission_1.PermissionType.ADMIN }
                });
                if (!apiPermission) {
                    res.status(403).json({ message: '无权删除API套餐' });
                    return;
                }
            }
        }
        // 删除套餐
        yield ApiPlan_1.ApiPlan.delete({ id });
        res.status(200).json({ message: 'API套餐删除成功' });
    }
    catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});
exports.deleteApiPlan = deleteApiPlan;
