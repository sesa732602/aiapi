"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiPermission = exports.PermissionType = void 0;
/**
 * API权限模型定义
 */
const typeorm_1 = require("typeorm");
const Api_1 = require("./Api");
const Team_1 = require("./Team");
const User_1 = require("./User");
// 权限类型枚举
/* eslint-disable no-unused-vars */
var PermissionType;
(function (PermissionType) {
    PermissionType["READ"] = "read";
    PermissionType["WRITE"] = "write";
    PermissionType["ADMIN"] = "admin";
})(PermissionType || (exports.PermissionType = PermissionType = {}));
/* eslint-enable no-unused-vars */
let ApiPermission = class ApiPermission extends typeorm_1.BaseEntity {
};
exports.ApiPermission = ApiPermission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ApiPermission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ApiPermission.prototype, "apiId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], ApiPermission.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], ApiPermission.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PermissionType,
        default: PermissionType.READ
    }),
    __metadata("design:type", String)
], ApiPermission.prototype, "permissionType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], ApiPermission.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ApiPermission.prototype, "targetId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ApiPermission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ApiPermission.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Api_1.Api, api => api.permissions),
    __metadata("design:type", Api_1.Api)
], ApiPermission.prototype, "api", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.apiPermissions),
    __metadata("design:type", User_1.User)
], ApiPermission.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Team_1.Team, team => team.apiPermissions),
    __metadata("design:type", Team_1.Team)
], ApiPermission.prototype, "team", void 0);
exports.ApiPermission = ApiPermission = __decorate([
    (0, typeorm_1.Entity)()
], ApiPermission);
