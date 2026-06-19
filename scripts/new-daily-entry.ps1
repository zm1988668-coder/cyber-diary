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
    # Find previous diary entry
    $prevEntry = Get-ChildItem "$DiaryDir\content\diary\*.md" |
        Where-Object { $_.Name -match '^\d{4}-\d{2}-\d{2}\.md$' -and $_.BaseName -lt $dateStr } |
        Sort-Object Name -Descending | Select-Object -First 1

    $prevLink = if ($prevEntry) { "← [[diary/$($prevEntry.BaseName)|$($prevEntry.BaseName)]]" } else { "" }
    $nextLink = ""  # no next entry yet when creating today's

    $navLine = if ($prevLink) { "$prevLink" } else { "" }

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

$navLine
"@
    Set-Content -Path $fileName -Value $content -Encoding utf8
    Write-Output "Created: $fileName"

    # Update previous entry to add forward link to today
    if ($prevEntry) {
        $prevContent = Get-Content $prevEntry.FullName -Raw -Encoding utf8
        $forwardLink = "→ [[diary/$dateStr|$dateStr]]"
        # Replace trailing nav line or append
        if ($prevContent -match '←.*\[\[diary/') {
            $prevContent = $prevContent -replace '(←[^\n]*)', "`$1  |  $forwardLink"
        } elseif ($prevContent -match '\n---\n\s*$') {
            $prevContent = $prevContent -replace '(\n---\n\s*)$', "`n---`n`n$forwardLink`n"
        } else {
            $prevContent = $prevContent.TrimEnd() + "`n`n→ [[diary/$dateStr|$dateStr]]`n"
        }
        Set-Content -Path $prevEntry.FullName -Value $prevContent -Encoding utf8 -NoNewline
        Write-Output "Updated prev entry nav: $($prevEntry.BaseName)"
    }
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

# Update recent entries list (keep latest 10, add new entry at top if title provided)
if ($Title -and $indexContent -notmatch [regex]::Escape("diary/$dateStr")) {
    $indexContent = $indexContent -replace '(## 📅 最近日记\r?\n\r?\n)', "`$1- [[diary/$dateStr|$dateStr]] — $Title`n"
}
# Trim to 10 entries and update count in "查看全部" link
$lines = $indexContent -split "`n"
$sectionStart = ($lines | Select-String -Pattern '^## 📅 最近日记').LineNumber - 1
$entryLines = @()
$otherLines = @()
$inSection = $false
$entryCount2 = 0
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($i -eq $sectionStart) { $inSection = $true }
    if ($inSection -and $lines[$i] -match '^\- \[\[diary/\d{4}-\d{2}-\d{2}') {
        $entryLines += $lines[$i]
    }
}
if ($entryLines.Count -gt 10) {
    $keep = $entryLines[0..9]
    $indexContent = $indexContent -replace [regex]::Escape(($entryLines -join "`n")), ($keep -join "`n")
}
# Update count in the "查看全部" link
$indexContent = $indexContent -replace '查看全部日记（共 \*\*\d+ 篇\*\*）', "查看全部日记（共 **$entryCount 篇**）"

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
