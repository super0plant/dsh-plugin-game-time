param([string]$Stamp, [string]$Root)
# Restore a backup made by backup.ps1: data first, then the code tag.
# Without -Stamp it uses the newest backup folder.
$ErrorActionPreference = 'Stop'
if (-not $Root) { $Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path }

$backups = Join-Path $Root 'backups'
if (-not (Test-Path $backups)) { throw "no backups folder at $backups" }
if (-not $Stamp) {
  $latest = Get-ChildItem $backups -Directory | Sort-Object Name -Descending | Select-Object -First 1
  if (-not $latest) { throw "no backup folders in $backups" }
  $Stamp = $latest.Name
}
$folder = Join-Path $backups $Stamp
if (-not (Test-Path $folder)) { throw "backup not found: $folder" }

# Never overwrite the live data without keeping a copy of what is there now.
$data = Join-Path $env:USERPROFILE '.dsh\storages\game-time'
if (Test-Path $data) {
  $safety = Join-Path $backups ("before-restore-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))
  New-Item -ItemType Directory -Force -Path $safety | Out-Null
  foreach ($name in 'config.json', 'sessions.json', 'active.json', 'presets.json') {
    $source = Join-Path $data $name
    if (Test-Path $source) { Copy-Item $source (Join-Path $safety $name) -Force }
  }
  Write-Host "current data saved : $safety"
}

New-Item -ItemType Directory -Force -Path $data | Out-Null
foreach ($name in 'config.json', 'sessions.json', 'active.json', 'presets.json') {
  $source = Join-Path $folder $name
  if (Test-Path $source) { Copy-Item $source (Join-Path $data $name) -Force }
}

Push-Location $Root
try {
  $tag = "backup-$Stamp"
  if (git tag -l $tag) {
    git reset --hard $tag | Out-Null
    Write-Host "code reset to : $tag"
  } else {
    Write-Host "no matching code tag - data only"
  }
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "restored to $Stamp"
Write-Host "next: restart DSH (host code changed); a UI-only change just needs a page refresh."
Write-Host ""
