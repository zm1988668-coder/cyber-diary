param(
    [string]$DiaryDir = "C:\Users\Lenovo\Desktop\赛博日记"
)

$date = Get-Date
$dateStr = $date.ToString("yyyy-MM-dd")
$fileName = "$DiaryDir\content\日记\$dateStr.md"
$monthDir = "$DiaryDir\content\日记"

# 创建目录（如果不存在）
if (-not (Test-Path $monthDir)) {
    New-Item -ItemType Directory -Path $monthDir -Force | Out-Null
}

# 检查是否已存在
if (Test-Path $fileName) {
    Write-Output "今日日记已存在: $fileName"
    exit 0
}

# 创建日记模板
$content = @"
---
title: $dateStr
date: $dateStr
tags:
  - daily
---

# $dateStr

## 今日完成



## 技能点



## 明日计划


"@

Set-Content -Path $fileName -Value $content -Encoding utf8
Write-Output "已创建日记: $fileName"

# 提交并推送
Set-Location $DiaryDir
git add -A
$status = git status --porcelain
if ($status) {
    git commit -m "每日日记: $dateStr"
    git push
    Write-Output "已推送到 GitHub"
} else {
    Write-Output "无变更，跳过提交"
}
