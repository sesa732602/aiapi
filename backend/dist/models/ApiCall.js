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
exports.ApiCall = void 0;
/**
 * API调用记录模型定义
 */
const typeorm_1 = require("typeorm");
const Api_1 = require("./Api");
const User_1 = require("./User");
let ApiCall = class ApiCall extends typeorm_1.BaseEntity {
};
exports.ApiCall = ApiCall;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ApiCall.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], ApiCall.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ApiCall.prototype, "apiId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ApiCall.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ApiCall.prototype, "responseTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'statusCode' }),
    __metadata("design:type", Number)
], ApiCall.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ApiCall.prototype, "requestSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ApiCall.prototype, "responseSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ApiCall.prototype, "requestData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ApiCall.prototype, "responseData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ApiCall.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Api_1.Api, api => api.calls),
    __metadata("design:type", Api_1.Api)
], ApiCall.prototype, "api", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.apiCalls),
    __metadata("design:type", User_1.User)
], ApiCall.prototype, "user", void 0);
exports.ApiCall = ApiCall = __decorate([
    (0, typeorm_1.Entity)()
], ApiCall);
