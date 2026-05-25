---
title: AI 驱动外贸获客系统
---

# AI 驱动外贸获客系统

> **状态：** ✅ 开发完成 | **核心理念：** 真实浏览器驱动，不 API 不爬虫

## 概述

面向外贸 B2B 行业的客户开发自动化系统，覆盖 5 大获客渠道，通过真实浏览器实现客户搜索、背调、联系方式采集全流程。

## 技术栈

- **浏览器驱动：** Puppeteer MCP + Chrome CDP（远程调试协议）
- **运行环境：** Claude Code + Node.js
- **架构模式：** Multi-Agent 并行作业

## 五大获客渠道

| # | 渠道 | 工具 | 采集内容 |
|---|------|------|---------|
| 1 | 社交媒体 | Facebook / Instagram | 行业群组、潜在客户 |
| 2 | 地图搜索 | Google Maps | 汽配店铺、联系方式 |
| 3 | B2B 平台 | 网易外贸通 | 采购商机、同行信息 |
| 4 | 展会名录 | 行业展会数据库 | 参展商、联系方式 |
| 5 | 海关数据 | 海关进出口记录 | 进口商、贸易伙伴 |

## 技术特色

- **真实浏览器：** 不走 API、不走爬虫，完全模拟真人操作
- **登录态复用：** Chrome CDP 连接现有浏览器，复用已登录会话
- **Multi-Agent：** 多个 Agent 并行搜索，互相不干扰
- **容错机制：** 检测反爬、验证码等异常，自动切换策略

## 浏览器策略

```
Chrome (--remote-debugging-port=18800) → CDP 连接 → Puppeteer MCP → Claude Code
```

8 个常开窗口：Facebook、Instagram、Google Maps、网易外贸通、Gmail、WhatsApp Web、LinkedIn、展会名录
