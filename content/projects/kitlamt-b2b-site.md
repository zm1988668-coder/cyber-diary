---
title: KITLAMT B2B 独立站
---

# KITLAMT B2B 独立站

> **状态：** ✅ 已上线 | **访问：** https://kitlamt.com

## 概述

汽车转向机领域的外贸 B2B 独立站，从零搭建，AI 辅助完成全流程。

## 技术栈

- **前端：** Next.js + Tailwind CSS
- **后端：** Node.js Express
- **数据库：** PostgreSQL
- **部署：** 香港 Vultr VPS + Nginx 反向代理
- **SSL：** Let's Encrypt 全站 HTTPS

## AI 辅助范围

| 阶段 | AI 角色 |
|------|---------|
| UI 设计 | Claude 生成组件 + 布局方案 |
| 后端开发 | 全栈 API 路由生成 |
| 数据库设计 | 表结构 + 查询优化 |
| 部署运维 | Nginx 配置 + SSL 证书 + 故障排查 |
| SEO | 关键词策略 + 元标签优化 |

## 技术挑战

**SSH 被阻断：** 公司网络限制 SSH 端口 22，无法直接连接 VPS。
**解决方案：** 自建 `deploy.php` HTTP 代理通道，通过 HTTPS 443 上传 ZIP 部署包。

```
本地 → deploy.php (HTTP/443) → VPS → 解压 → Nginx 热加载
```

## 链接

- 线上站点：https://kitlamt.com
- GitHub：https://github.com/zm1988668-coder/cyber-diary
