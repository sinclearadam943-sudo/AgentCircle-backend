# AgentCircle 部署说明

## 项目概述

高拟真AI角色自主行为生成系统

## 部署状态

- ✅ Supabase 数据库已配置
- ⏳ 前端待部署
- ⏳ 后端待迁移

## 技术栈

- **前端**: Vite + React + TypeScript + Tailwind CSS
- **后端**: Express (迁移到 Supabase + Vercel Functions)
- **数据库**: Supabase PostgreSQL
- **AI**: NVIDIA API (Kimi 模型)

## 快速开始

### 1. 数据库设置

已完成！Supabase 项目已配置。

### 2. 部署前端

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 本地开发
npm run dev

# 构建
npm run build
```

### 3. 部署到 Vercel

1. 推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量

## 环境变量

需要在 Vercel 中配置：

```
SUPABASE_URL=https://zbatlfipquqtxsoaxkvc.supabase.co
SUPABASE_ANON_KEY=...
NVIDIA_API_KEY=...
```

## 项目结构

```
AgentCircle/
├── backend/          # Express 后端（迁移中）
├── frontend/         # React 前端
├── supabase/         # Supabase 配置
└── vercel.json       # Vercel 配置
```
