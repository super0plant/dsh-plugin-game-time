param([string]$Root)
# One-click backup: copies the game-time data files and tags the current code.
# Restore with restore.cmd (or scripts/restore.ps1 -Stamp <stamp>).
$ErrorActionPreference = 'Stop'
if (-not $Root) { $Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path }

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$data = Join-Path $env:USERPROFILE '.dsh\storages\game-time'
$folder = Join-Path $Root "backups\$stamp"
New-Item -ItemType Directory -Force -Path $folder | Out-Null

$copied = 0
foreach ($name in 'config.json', 'sessions.json', 'active.json', 'presets.json') {
  $source = Join-Path $data $name
  if (Test-Path $source) {
    Copy-Item $source (Join-Path $folder $name) -Force
    $copied += 1
  }
}

Push-Location $Root
try {
  $tag = "backup-$stamp"
  git tag $tag 2>$null | Out-Null
  if (-not (git tag -l $tag)) { throw "cannot tag $tag" }
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "backup done"
Write-Host "  data : $folder ($copied files)"
Write-Host "  code : git tag $tag"
Write-Host "  undo : restore.cmd  ->  $stamp"
Write-Host ""
