# Game Time - desktop launcher.
#
# Keeps the local collector (standalone/server.mjs) running, opens an Edge
# "app" window (no address bar, no tabs) and parks a tray icon next to the
# clock so the app can be reopened or quit without a console window.
#
# Started by start.cmd; `-NoWindow` skips opening the window (used by tests).

param([switch]$NoWindow)

$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $here
$base = 'http://127.0.0.1:45917'
$entry = Join-Path $here 'server.mjs'
$iconPath = Join-Path $root 'icon.ico'
$logDir = Join-Path $env:LOCALAPPDATA 'GameTime'
$logPath = Join-Path $logDir 'launcher.log'
try {
  if (-not (Test-Path -LiteralPath $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
} catch { }

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Write-Log([string]$message) {
  try {
    Add-Content -LiteralPath $logPath -Value ((Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + '  ' + $message) -Encoding UTF8
  } catch { }
}

function Test-Server {
  try {
    $response = Invoke-WebRequest -Uri ($base + '/api/game-time/state') -UseBasicParsing -TimeoutSec 1
    return ($response.StatusCode -eq 200)
  } catch { return $false }
}

function Start-Server {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if (-not $node) {
    throw 'Node.js was not found on PATH. Install the LTS build from https://nodejs.org/ and run start.cmd again.'
  }
  Write-Log ('starting collector: ' + $node.Source)
  Start-Process -FilePath $node.Source -ArgumentList ('"' + $entry + '" --no-open') -WindowStyle Hidden | Out-Null
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Milliseconds 250
    if (Test-Server) { return }
  }
  throw 'The collector did not answer on http://127.0.0.1:45917. See standalone\launcher-error.log.'
}

function Get-Edge {
  $candidates = @()
  if ($env:ProgramFiles) { $candidates += (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe') }
  if (${env:ProgramFiles(x86)}) { $candidates += (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe') }
  foreach ($path in $candidates) { if (Test-Path -LiteralPath $path) { return $path } }
  return $null
}

function Open-Panel {
  $edge = Get-Edge
  if ($edge) {
    Start-Process -FilePath $edge -ArgumentList @('--app=' + $base + '/', '--window-size=1180,840') | Out-Null
  } else {
    # No Edge: fall back to whatever the user has set as default browser.
    Start-Process $base | Out-Null
  }
}

function Get-Autostart {
  try {
    $response = Invoke-WebRequest -Uri ($base + '/api/game-time/state') -UseBasicParsing -TimeoutSec 2
    $state = $response.Content | ConvertFrom-Json
    return [bool]$state.env.autostart.enabled
  } catch { return $false }
}

function Set-Autostart([bool]$enabled) {
  $body = @{ enabled = $enabled } | ConvertTo-Json
  Invoke-WebRequest -Uri ($base + '/api/game-time/autostart') -Method Post -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 5 | Out-Null
}

function Stop-Collector {
  try {
    Invoke-WebRequest -Uri ($base + '/api/game-time/shutdown') -Method Post -UseBasicParsing -TimeoutSec 3 | Out-Null
  } catch { }
}

try {
  # One tray per desktop session: a second start.cmd just brings the window back.
  $created = $false
  $mutex = New-Object System.Threading.Mutex($true, 'Local\GameTimeTray', [ref]$created)
  if (-not $created) {
    Open-Panel
    exit 0
  }

  if (-not (Test-Server)) { Start-Server }

  $notify = New-Object System.Windows.Forms.NotifyIcon
  $notify.Icon = New-Object System.Drawing.Icon($iconPath)
  $notify.Text = '游戏时长'
  $notify.Visible = $true

  $menu = New-Object System.Windows.Forms.ContextMenuStrip
  $itemOpen = $menu.Items.Add('打开面板')
  $itemAuto = $menu.Items.Add('开机自启')
  $itemAuto.CheckOnClick = $true
  $itemQuit = $menu.Items.Add('退出')
  $notify.ContextMenuStrip = $menu

  $itemOpen.add_Click({ Open-Panel })
  $notify.add_DoubleClick({ Open-Panel })

  $itemAuto.add_Click({
    try {
      $next = -not (Get-Autostart)
      Set-Autostart $next
      $itemAuto.Checked = $next
      $message = '已设置为随 Windows 启动'
      if (-not $next) { $message = '已取消随 Windows 启动' }
      $notify.ShowBalloonTip(2000, '游戏时长', $message, 'Info')
    } catch {
      $notify.ShowBalloonTip(2000, '游戏时长', ('设置失败：' + $_.Exception.Message), 'Warning')
    }
  })

  $itemQuit.add_Click({
    Stop-Collector
    Start-Sleep -Milliseconds 700
    $notify.Visible = $false
    $form.Close()
  })

  $itemAuto.Checked = Get-Autostart

  # A hidden owner form keeps the message pump alive; Application.Run() with no
  # form can return immediately on some PowerShell hosts, which used to leave
  # the collector running with no tray icon.
  $form = New-Object System.Windows.Forms.Form
  $form.ShowInTaskbar = $false
  $form.FormBorderStyle = 'None'
  $form.WindowState = 'Minimized'
  $form.Opacity = 0
  $form.Size = New-Object System.Drawing.Size(1, 1)
  $form.StartPosition = 'Manual'
  $form.Location = New-Object System.Drawing.Point(-3000, -3000)

  if (-not $NoWindow) { Open-Panel }
  $notify.ShowBalloonTip(4000, '游戏时长', '已缩到托盘：右键图标可以打开面板或退出（Windows 11 可能折叠在 ^ 里）', 'Info')
  Write-Log ('tray ready; data dir ' + $env:DSH_HOME)

  [System.Windows.Forms.Application]::Run($form)

  Write-Log 'tray closed'
  $notify.Visible = $false
  $notify.Dispose()
  exit 0
} catch {
  Write-Log ($_.Exception.Message)
  try {
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, '游戏时长', 'OK', 'Error') | Out-Null
  } catch { }
  exit 1
}
