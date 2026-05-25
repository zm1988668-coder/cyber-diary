---
title: 赛博日记知识库
---

# 赛博日记知识库

> **状态：** ✅ 已上线 | **访问：** https://zm1988668-coder.github.io/cyber-diary/ | **更新：** 每日自动

## 概述

个人技术博客 + 知识库 + 工作日报 + 复盘记录，四维一体格式。每天自动生成、自动部署。

## 技术栈

- **框架：** Quartz 4.5.2（静态站点生成器）
- **部署：** GitHub Pages + GitHub Actions
- **域名：** GitHub Pages 免费托管
- **自动触发：** Windows Task Scheduler

## 自动化流水线

```
Task Scheduler (每日 9:00)
    → PowerShell 脚本创建日记模板
    → git add + commit + push
    → GitHub Actions CI/CD
    → GitHub Pages 上线
```

## 内容格式（四维一体）

每篇日记包含四个维度：
1. **工作日报** — 当日完成事项、项目进展
2. **技术博客** — 技术细节、代码示例、踩坑记录
3. **知识库** — 可复用的配置、命令、代码片段
4. **复盘** — 那些做对了、哪些做错了、教训

## 设计特色

- 深蓝赛博主题配色
- 中文字体 Noto Sans SC + 代码字体 JetBrains Mono
- locale 设为 zh-CN（Quartz 内置中文翻译）
- 移除 Graph 图谱、Backlinks（专注内容阅读）
- 工具拓扑图（Mermaid 图表展示全工具链）

## 数据

- 日记数量：12+ 篇（持续增长）
- 更新时间：每天 9:00 自动
- 部署方式：push 即上线
