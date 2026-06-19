param(
    [string]$DiaryDir = "D:\cyber-diary",
    [string]$Title = ""
)

Set-Location $DiaryDir

$date = Get-Date
$dateStr = $date.ToString("yyyy-MM-dd")
$monthLabel = $date.ToString("yyyy年M月")
$fileName = "$DiaryDir\content\diary\$dateStr.md"

# --- 1. Create diary file if not exists ---
if (-not (Test-Path $fileName)) {
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
    Write-Output "Created: $fileName"
}

# --- 2. Count diary entries and days ---
$allEntries = Get-ChildItem "$DiaryDir\content\diary\*.md" | Where-Object { $_.Name -match '^\d{4}-\d{2}-\d{2}\.md$' } | Sort-Object Name -Descending
$entryCount = $allEntries.Count
$firstDate = ($allEntries | Sort-Object Name | Select-Object -First 1).BaseName
$daysSince = ((Get-Date) - [datetime]$firstDate).Days + 1

# --- 3. Update index.md stats ---
$indexPath = "$DiaryDir\content\index.md"
$indexContent = Get-Content $indexPath -Raw -Encoding utf8

# Update stats table
$indexContent = $indexContent -replace '已坚持 \*\*\d+ 天\*\*', "已坚持 **$daysSince 天**"
$indexContent = $indexContent -replace '已记录 \*\*\d+ 篇\*\*', "已记录 **$entryCount 篇**"

# Update timeline (add new entry if not already there)
$timelineEntry = "- [[diary/$dateStr|$dateStr]]"
if ($Title -and $indexContent -notmatch [regex]::Escape("diary/$dateStr")) {
    $indexContent = $indexContent -replace '(## 📅 日记时间线\r?\n\r?\n)', "`$1- [[diary/$dateStr|$dateStr]] — $Title`n"
}

Set-Content -Path $indexPath -Value $indexContent -Encoding utf8 -NoNewline

# --- 4. Update diary/index.md stats ---
$diaryIndexPath = "$DiaryDir\content\diary\index.md"
$diaryContent = Get-Content $diaryIndexPath -Raw -Encoding utf8
$diaryContent = $diaryContent -replace '已坚持记录 \*\*\d+ 天\*\*', "已坚持记录 **$daysSince 天**"
$diaryContent = $diaryContent -replace '共 \*\*\d+ 篇\*\*', "共 **$entryCount 篇**"
Set-Content -Path $diaryIndexPath -Value $diaryContent -Encoding utf8 -NoNewline

# --- 5. Update 工具拓扑图 date ---
$topoPath = "$DiaryDir\content\工具拓扑图.md"
$topoContent = Get-Content $topoPath -Raw -Encoding utf8
$topoContent = $topoContent -replace '最后更新时间：\d{4}-\d{2}-\d{2}', "最后更新时间：$dateStr"
Set-Content -Path $topoPath -Value $topoContent -Encoding utf8 -NoNewline

Write-Output "Stats updated: $daysSince days, $entryCount entries"

# --- 6. Git commit and push ---
git add -A
$status = git status --porcelain
if ($status) {
    git commit -m "diary: $dateStr - daily update"
    git push
    Write-Output "Pushed to GitHub"
} else {
    Write-Output "No changes to push"
}
