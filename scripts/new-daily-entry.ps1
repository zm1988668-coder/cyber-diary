param(
    [string]$DiaryDir = "D:\cyber-diary"
)

# Force working directory to repo root
Set-Location $DiaryDir

$date = Get-Date
$dateStr = $date.ToString("yyyy-MM-dd")
$fileName = "$DiaryDir\content\diary\$dateStr.md"
$diaryDir = "$DiaryDir\content\diary"

if (-not (Test-Path $diaryDir)) {
    New-Item -ItemType Directory -Path $diaryDir -Force | Out-Null
}

if (Test-Path $fileName) {
    Write-Output "Today's diary already exists: $fileName"
    exit 0
}

$content = @"
---
title: $dateStr
date: $dateStr
tags:
  - daily
---

# $dateStr

## 遇到了什么


## 怎么解决的


## 结果

| 项目 | 完成情况 |
|------|---------|
|  |  |

## 踩过的坑


## 学到什么


---

*相关：*
"@

Set-Content -Path $fileName -Value $content -Encoding utf8
Write-Output "Created diary: $fileName"

git add -A
$status = git status --porcelain
if ($status) {
    git commit -m "diary: add $dateStr entry"
    git push
    Write-Output "Pushed to GitHub"
} else {
    Write-Output "No changes, skipping commit"
}
