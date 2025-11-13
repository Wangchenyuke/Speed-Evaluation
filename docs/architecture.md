# SPEED Platform Architecture & Delivery Plan

## 1. Project Overview

SPEED（Software Practice Empirical Evidence Database）旨在为软件工程相关的实证研究提供一套完整的采集、审核、分析与搜索平台。本项目将升级为前后端分离的 Web 应用，后端基于 **Node.js + Nest.js**，数据存储选用 **MongoDB**，前端将构建可扩展的多角色界面，最终通过 **Vercel** 与 **GitHub Actions** 实现持续集成与部署。

## 2. High-Level Architecture

```
frontend/          # Next.js (React) 应用
  ├─ app/          # 多角色路由与界面
  ├─ components/   # 共享 UI 组件
  ├─ lib/          # API 客户端、状态管理
  └─ public/       # 静态资源

backend/           # Nest.js 服务
  ├─ src/
  │   ├─ modules/  # 功能模块：auth, submissions, reviews, analyses, search, admin
  │   ├─ prisma/   # （如采用 Prisma，可选）
  │   └─ main.ts
  └─ test/

infrastructure/
  ├─ workflows/    # GitHub Actions 配置
  └─ vercel/       # Vercel 项目配置 & 环境变量说明

docs/
  ├─ architecture.md   # 体系结构与计划（当前文件）
  ├─ api-spec.md       # API 设计（待补充）
  └─ data-model.md     # 数据模型（待补充）
```

## 3. Core Domain Entities

| Entity        | Description                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------- |
| `Submission`  | 提交者提交的原始文献信息、状态流转、提交者信息                                              |
| `ReviewTask`  | 审核队列项，记录审核者分配、审核决策、重复检测信息                                          |
| `AnalysisTask`| 分析队列项，记录分析师提取的实践、声明、证据结果等数据                                       |
| `Paper`       | 审核与分析完成后的正式文献实体，为公开搜索提供数据                                          |
| `User`        | 用户账户，包含角色（Submitter, Moderator, Analyst, Admin, Searcher）与权限                   |
| `Rating`      | 搜索者对文章的评分记录，用于计算平均评分                                                     |

## 4. Delivery Roadmap

### Phase 1 – 基础架构搭建
1. 初始化 Git 仓库结构：`frontend/` 与 `backend/`
2. 使用 Nest CLI 初始化后端，配置 MongoDB 连接（含 `.env` 模板）
3. 设计核心数据模型与模块骨架：`auth`, `submissions`, `reviews`, `analyses`, `papers`, `admin`
4. 初始化 Next.js 前端应用，接入 UI 框架（Ant Design / Chakra）
5. 配置基础 CI（lint + 单元测试）与 Vercel 部署占位

### Phase 2 – 角色工作流实现
1. **提交者**：表单提交（含 BibTeX 上传解析）、提交历史、状态提示
2. **审核者**：审核队列、重复检测（初版可根据 DOI/标题）、审核操作与通知
3. **分析师**：分析队列、信息录入表单、与提交数据同步
4. **搜索者**：高级搜索、筛选、列定制、评分系统
5. **管理员**：基础配置面板、数据字典管理

### Phase 3 – 通知 & 自动化
1. 邮件通知（SendGrid/SMTP）整合审核、分析队列提醒
2. 引入任务队列（BullMQ + Redis）处理异步通知、重复检测
3. 完善 GitHub Actions（自动化部署、集成测试、代码审查流程）
4. 安全与权限加固：JWT/OAuth2、角色访问控制

### Phase 4 – 扩展与优化（可选）
1. AI 自动提取文本辅助分析
2. ChatBot 查询助手
3. 卡片式/可视化结果展示

## 5. Immediate Next Steps
1. 搭建 `backend/` Nest.js 工程并配置 MongoDB 连接（含 Docker Compose 或 Atlas 说明）
2. 设计并提交数据模型草图（`docs/data-model.md`）
3. 初始化 `frontend/` Next.js 应用并接入设计系统
4. 将现有静态页迁移至 `frontend/legacy/` 目录，为后续 React 重构提供参考

---

此计划将作为后续开发迭代的基准文档，执行过程中会在 `docs/` 目录持续追加 API 规范、数据模型、通知流程等文档，确保多角色协同与可维护性。


