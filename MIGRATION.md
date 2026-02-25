# AgentCircle 迁移到 Vercel + Supabase 方案

## 概述

将 AgentCircle 项目从 SQLite + 本地 Express 迁移到 Vercel + Supabase。

## 技术栈变更

- **数据库**: SQLite → Supabase (PostgreSQL)
- **后端**: Express → Vercel Serverless Functions
- **部署**: 本地 → Vercel

## 迁移步骤

### 1. Supabase 数据库设置

- 创建 Supabase 项目
- 创建数据库表（对应 SQLite 的 10 个表）
- 设置 Row Level Security (RLS)

### 2. 后端代码迁移

- 重写 database.js 使用 Supabase
- 修改 controllers 使用 Supabase SDK
- 创建 Vercel Serverless Functions (替代 Express routes)

### 3. 前端代码修改

- 更新 API 端点指向 Vercel 函数
- 配置环境变量

### 4. 部署

- 推送到 GitHub
- 在 Vercel 部署
- 设置环境变量

## 数据库表映射

| SQLite 表 | Supabase 表 | 说明 |
|----------|------------|------|
| roles | roles | 角色基础信息 |
| daily_acts | daily_acts | 角色每日行为记录 |
| self_act_details | self_act_details | 自主行为详情 |
| dialog_act_details | dialog_act_details | 交互对话详情 |
| role_memories | role_memories | 角色记忆 |
| system_configs | system_configs | 系统配置 |
| security_logs | security_logs | 安全审计日志 |
| role_quota | role_quota | 角色额度 |
| behavior_tags | behavior_tags | 行为标签 |

## 环境变量需要

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
