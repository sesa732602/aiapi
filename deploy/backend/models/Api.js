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
exports.Api = exports.ApiMethod = void 0;
/**
 * API模型定义
 */
const typeorm_1 = require("typeorm");
const ApiVersion_1 = require("./ApiVersion");
const ApiPermission_1 = require("./ApiPermission");
const ApiPlan_1 = require("./ApiPlan");
const ApiCall_1 = require("./ApiCall");
var ApiMethod;
(function (ApiMethod) {
    ApiMethod["GET"] = "GET";
    ApiMethod["POST"] = "POST";
    ApiMethod["PUT"] = "PUT";
    ApiMethod["DELETE"] = "DELETE";
    ApiMethod["PATCH"] = "PATCH";
})(ApiMethod || (exports.ApiMethod = ApiMethod = {}));
let Api = class Api extends typeorm_1.BaseEntity {
};
exports.Api = Api;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Api.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Api.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Api.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Api.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ApiMethod,
        default: ApiMethod.GET
    }),
    __metadata("design:type", String)
], Api.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], Api.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Api.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Api.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Api.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ApiVersion_1.ApiVersion, version => version.api),
    __metadata("design:type", Array)
], Api.prototype, "versions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ApiPermission_1.ApiPermission, permission => permission.api),
    __metadata("design:type", Array)
], Api.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ApiPlan_1.ApiPlan, plan => plan.api),
    __metadata("design:type", Array)
], Api.prototype, "plans", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ApiCall_1.ApiCall, call => call.api),
    __metadata("design:type", Array)
], Api.prototype, "calls", void 0);
exports.Api = Api = __decorate([
    (0, typeorm_1.Entity)()
], Api);
