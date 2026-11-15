/**
 * Game Time — PowerShell faces: exe icons, file picking, directory browsing.
 */
import { execFile } from 'node:child_process'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { DIR } from './constants.js'

export const ICON_SCRIPT = [
  'Add-Type -AssemblyName System.Drawing',
  "Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'",
  'using System;',
  'using System.Drawing;',
  'using System.Drawing.Imaging;',
  'using System.IO;',
  'using System.Runtime.InteropServices;',
  'public static class GTIcon {',
  '  [StructLayout(LayoutKind.Sequential)]',
  '  public struct BITMAP { public int bmType; public int bmWidth; public int bmHeight; public int bmWidthBytes; public short bmPlanes; public short bmBitsPixel; public IntPtr bmBits; }',
  '  [StructLayout(LayoutKind.Sequential)]',
  '  public struct BITMAPINFOHEADER { public uint biSize; public int biWidth; public int biHeight; public ushort biPlanes; public ushort biBitCount; public uint biCompression; public uint biSizeImage; public int biXPelsPerMeter; public int biYPelsPerMeter; public uint biClrUsed; public uint biClrImportant; }',
  '  [StructLayout(LayoutKind.Sequential)]',
  '  public struct BITMAPINFO { public BITMAPINFOHEADER bmiHeader; public uint bmiColors; }',
  '  [StructLayout(LayoutKind.Sequential)]',
  '  public struct SIZE { public int cx; public int cy; public SIZE(int x, int y) { cx = x; cy = y; } }',
  '  [ComImport, Guid("bcc18b79-ba16-442f-80c4-8a59c30c463b"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]',
  '  interface IShellItemImageFactory { int GetImage(SIZE size, int flags, out IntPtr phbm); }',
  '  [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]',
  '  static extern void SHCreateItemFromParsingName(string path, IntPtr bindCtx, [MarshalAs(UnmanagedType.LPStruct)] Guid riid, [MarshalAs(UnmanagedType.Interface)] out object shellItem);',
  '  [DllImport("gdi32.dll")] static extern bool DeleteObject(IntPtr handle);',
  '  [DllImport("gdi32.dll")] static extern int GetObject(IntPtr hObject, int size, ref BITMAP info);',
  '  [DllImport("gdi32.dll")] static extern int GetDIBits(IntPtr hdc, IntPtr hbm, uint start, uint lines, byte[] bits, ref BITMAPINFO info, uint usage);',
  '  [DllImport("user32.dll")] static extern IntPtr GetDC(IntPtr hWnd);',
  '  [DllImport("user32.dll")] static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);',

  '  public static int NativeSize(string file) {',
  '    try {',
  '      if (file.EndsWith(".ico", StringComparison.OrdinalIgnoreCase)) return IcoSize(file);',
  '      return ModuleSize(file);',
  '    } catch { return 0; }',
  '  }',
  '',
  '  static int IcoSize(string file) {',
  '    byte[] bytes = File.ReadAllBytes(file);',
  '    if (bytes.Length < 6) return 0;',
  '    if (BitConverter.ToUInt16(bytes, 2) != 1) return 0;',
  '    int count = BitConverter.ToUInt16(bytes, 4);',
  '    int max = 0;',
  '    for (int i = 0; i < count; i++) {',
  '      int offset = 6 + i * 16;',
  '      if (offset + 2 > bytes.Length) break;',
  '      int width = bytes[offset] == 0 ? 256 : bytes[offset];',
  '      int height = bytes[offset + 1] == 0 ? 256 : bytes[offset + 1];',
  '      if (width > max) max = width;',
  '      if (height > max) max = height;',
  '    }',
  '    return max;',
  '  }',
  '',
  '  static int ModuleSize(string file) {',
  '    using (FileStream stream = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {',
  '      byte[] dos = ReadAt(stream, 0, 0x40);',
  '      if (dos == null) return 0;',
  '      int pe = BitConverter.ToInt32(dos, 0x3C);',
  '      byte[] nt = ReadAt(stream, pe, 24);',
  '      if (nt == null || BitConverter.ToUInt32(nt, 0) != 0x00004550) return 0;',
  '      int sections = BitConverter.ToUInt16(nt, 6);',
  '      int optionalSize = BitConverter.ToUInt16(nt, 20);',
  '      if (sections <= 0 || optionalSize < 96) return 0;',
  '      byte[] header = ReadAt(stream, pe + 24, optionalSize + sections * 40);',
  '      if (header == null || header.Length < optionalSize) return 0;',
  '      ushort magic = BitConverter.ToUInt16(header, 0);',
  '      int dataDirectory = magic == 0x10B ? 96 : magic == 0x20B ? 112 : -1;',
  '      if (dataDirectory < 0 || header.Length < dataDirectory + 24) return 0;',
  '      uint resourceRva = BitConverter.ToUInt32(header, dataDirectory + 16);',
  '      if (resourceRva == 0) return 0;',
  '      long resourceOffset = 0;',
  '      for (int i = 0; i < sections; i++) {',
  '        int entry = optionalSize + i * 40;',
  '        if (entry + 40 > header.Length) return 0;',
  '        uint virtualSize = BitConverter.ToUInt32(header, entry + 8);',
  '        uint virtualAddress = BitConverter.ToUInt32(header, entry + 12);',
  '        uint rawSize = BitConverter.ToUInt32(header, entry + 16);',
  '        uint rawPointer = BitConverter.ToUInt32(header, entry + 20);',
  '        if (resourceRva >= virtualAddress && resourceRva < virtualAddress + Math.Max(virtualSize, rawSize)) {',
  '          resourceOffset = (long)rawPointer + (resourceRva - virtualAddress);',
  '          break;',
  '        }',
  '      }',
  '      if (resourceOffset <= 0) return 0;',
  '      long groups = FindTypeDirectory(stream, resourceOffset, 14);',
  '      if (groups <= 0) return 0;',
  '      long languages = FirstEntry(stream, resourceOffset + groups);',
  '      if (languages <= 0) return 0;',
  '      long record = FirstEntry(stream, resourceOffset + languages);',
  '      if (record <= 0) return 0;',
  '      byte[] entryInfo = ReadAt(stream, resourceOffset + record, 16);',
  '      if (entryInfo == null) return 0;',
  '      uint dataRva = BitConverter.ToUInt32(entryInfo, 0);',
  '      uint dataSize = BitConverter.ToUInt32(entryInfo, 4);',
  '      if (dataRva < resourceRva || dataSize < 6 || dataSize > 65536) return 0;',
  '      byte[] group = ReadAt(stream, resourceOffset + (long)(dataRva - resourceRva), (int)dataSize);',
  '      if (group == null || group.Length < 6) return 0;',
  '      int count = BitConverter.ToUInt16(group, 4);',
  '      int max = 0;',
  '      for (int i = 0; i < count; i++) {',
  '        int offset = 6 + i * 14;',
  '        if (offset + 2 > group.Length) break;',
  '        int width = group[offset] == 0 ? 256 : group[offset];',
  '        int height = group[offset + 1] == 0 ? 256 : group[offset + 1];',
  '        if (width > max) max = width;',
  '        if (height > max) max = height;',
  '      }',
  '      return max;',
  '    }',
  '  }',
  '',
  '  static long FindTypeDirectory(FileStream stream, long resourceOffset, int type) {',
  '    byte[] head = ReadAt(stream, resourceOffset, 16);',
  '    if (head == null) return 0;',
  '    int count = BitConverter.ToUInt16(head, 12) + BitConverter.ToUInt16(head, 14);',
  '    if (count <= 0 || count > 4096) return 0;',
  '    byte[] entries = ReadAt(stream, resourceOffset + 16, count * 8);',
  '    if (entries == null) return 0;',
  '    for (int i = 0; i < count; i++) {',
  '      uint name = BitConverter.ToUInt32(entries, i * 8);',
  '      uint offset = BitConverter.ToUInt32(entries, i * 8 + 4);',
  '      if (name == (uint)type && (offset & 0x80000000) != 0) return offset & 0x7FFFFFFF;',
  '    }',
  '    return 0;',
  '  }',
  '',
  '  static long FirstEntry(FileStream stream, long directory) {',
  '    byte[] head = ReadAt(stream, directory, 16);',
  '    if (head == null) return 0;',
  '    int count = BitConverter.ToUInt16(head, 12) + BitConverter.ToUInt16(head, 14);',
  '    if (count <= 0) return 0;',
  '    byte[] entry = ReadAt(stream, directory + 16, 8);',
  '    if (entry == null) return 0;',
  '    return BitConverter.ToUInt32(entry, 4) & 0x7FFFFFFF;',
  '  }',
  '',
  '  static byte[] ReadAt(FileStream stream, long offset, int count) {',
  '    if (offset < 0 || count <= 0 || offset + count > stream.Length) return null;',
  '    byte[] buffer = new byte[count];',
  '    stream.Seek(offset, SeekOrigin.Begin);',
  '    int read = 0;',
  '    while (read < count) {',
  '      int chunk = stream.Read(buffer, read, count - read);',
  '      if (chunk <= 0) return null;',
  '      read += chunk;',
  '    }',
  '    return buffer;',
  '  }',
  '',
  '  public static string Extract(string file) {',
  '    if (String.IsNullOrEmpty(file)) return "";',
  '    int size = NativeSize(file);',
  '    if (size <= 0 || size > 256) size = 256;',
  '    object item;',
  '    SHCreateItemFromParsingName(file, IntPtr.Zero, typeof(IShellItemImageFactory).GUID, out item);',
  '    var factory = (IShellItemImageFactory)item;',
  '    IntPtr hbm;',
  '    int hr = factory.GetImage(new SIZE(size, size), 4, out hbm);',
  '    if (hr != 0 || hbm == IntPtr.Zero) return "";',
  '    try {',
  '      using (Bitmap bitmap = Decode(hbm)) {',
  '        if (bitmap == null) return "";',
  '        using (MemoryStream stream = new MemoryStream()) {',
  '          bitmap.Save(stream, ImageFormat.Png);',
  '          return Convert.ToBase64String(stream.ToArray());',
  '        }',
  '      }',
  '    } finally { DeleteObject(hbm); }',
  '  }',
  '',
  '  static Bitmap Decode(IntPtr hbm) {',
  '    BITMAP info = new BITMAP();',
  '    if (GetObject(hbm, Marshal.SizeOf(typeof(BITMAP)), ref info) == 0) return null;',
  '    int width = info.bmWidth;',
  '    int height = info.bmHeight;',
  '    if (width <= 0 || height <= 0) return null;',
  '    if (info.bmBitsPixel != 32) return Image.FromHbitmap(hbm);',
  '    byte[] pixels = new byte[width * height * 4];',
  '    BITMAPINFO header = new BITMAPINFO();',
  '    header.bmiHeader.biSize = 40;',
  '    header.bmiHeader.biWidth = width;',
  '    header.bmiHeader.biHeight = height;',
  '    header.bmiHeader.biPlanes = 1;',
  '    header.bmiHeader.biBitCount = 32;',
  '    header.bmiHeader.biCompression = 0;',
  '    IntPtr dc = GetDC(IntPtr.Zero);',
  '    int lines;',
  '    try { lines = GetDIBits(dc, hbm, 0, (uint)height, pixels, ref header, 0); } finally { ReleaseDC(IntPtr.Zero, dc); }',
  '    if (lines == 0) return Image.FromHbitmap(hbm);',
  '    Bitmap bitmap = new Bitmap(width, height, PixelFormat.Format32bppArgb);',
  '    BitmapData data = bitmap.LockBits(new Rectangle(0, 0, width, height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);',
  '    try {',
  '      for (int y = 0; y < height; y++) {',
  '        Marshal.Copy(pixels, (height - 1 - y) * width * 4, IntPtr.Add(data.Scan0, y * data.Stride), width * 4);',
  '      }',
  '    } finally { bitmap.UnlockBits(data); }',
  '    return bitmap;',
  '  }',
  '}',
  "'@",
  '$file = $args[0]',
  "if ($file -and [System.IO.Path]::GetExtension($file) -eq '.lnk') {",
  '  try {',
  '    $shell = New-Object -ComObject WScript.Shell',
  '    $target = $shell.CreateShortcut($file).TargetPath',
  '    if ($target) { $file = $target }',
  '  } catch { }',
  '}',
  '$value = ""',
  'try { $value = [GTIcon]::Extract($file) } catch { $value = "" }',
  'if ($value.Length -eq 0) {',
  '  try {',
  '    $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($file)',
  '    if ($icon) {',
  '      $bitmap = $icon.ToBitmap()',
  '      $memory = New-Object System.IO.MemoryStream',
  '      $bitmap.Save($memory, [System.Drawing.Imaging.ImageFormat]::Png)',
  '      $value = [Convert]::ToBase64String($memory.ToArray())',
  '    }',
  '  } catch { $value = "" }',
  '}',
  'if ($value.Length -gt 0) { $value }',
].join('\n')

export const PICK_SCRIPT = String.raw`
Add-Type -AssemblyName System.Windows.Forms
$outPath = [string]$args[-1]
$path = ''
# A shown owner form gives the dialog a real parent window. Without it Windows
# can place the dialog behind the DSH window: the click looks ignored, the user
# clicks again, and several dialogs pile up on top of each other.
$owner = New-Object System.Windows.Forms.Form
$owner.Text = 'Game Time'
$owner.FormBorderStyle = 'None'
$owner.ShowInTaskbar = $false
$owner.StartPosition = 'CenterScreen'
$owner.Width = 1
$owner.Height = 1
$owner.TopMost = $true
$owner.Show()
try {
  $dialog = New-Object System.Windows.Forms.OpenFileDialog
  $dialog.Title = 'Select a game program'
  $dialog.Filter = 'Programs (*.exe;*.lnk;*.url)|*.exe;*.lnk;*.url|Programs (*.exe)|*.exe|All files (*.*)|*.*'
  $dialog.CheckFileExists = $true
  $dialog.RestoreDirectory = $true
  if ($dialog.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) { $path = [string]$dialog.FileName }
  $dialog.Dispose()
} finally {
  $owner.Close()
  $owner.Dispose()
}
$json = [pscustomobject]@{ path = $path } | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText($outPath, $json, (New-Object System.Text.UTF8Encoding($false)))
`

/**
 * Resolve one launch file to the real game exe, and give the game a name.
 *
 * Handles .exe, .lnk (WScript.Shell) and .url. A Steam shortcut
 * (`steam://rungameid/<id>`) is followed through libraryfolders.vdf and
 * appmanifest_<id>.acf to the installed folder, then the biggest plausible exe.
 * Everything is written as UTF-8 JSON to `$args[-1]`: PowerShell's stdout uses
 * the console code page, which turns Chinese paths into mojibake.
 */
export const RESOLVE_SCRIPT = String.raw`
$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'
$raw = ''
if ($args.Count -gt 0) { $raw = [string]$args[0] }
$outPath = [string]$args[-1]
$result = [ordered]@{ ok = $false; path = ''; name = ''; kind = ''; platformId = ''; url = ''; warning = '' }

function Find-SteamGame([string]$appId) {
  $roots = New-Object System.Collections.ArrayList
  try { [void]$roots.Add((Get-ItemProperty 'HKCU:\Software\Valve\Steam' -ErrorAction Stop).SteamPath) } catch { }
  if ($roots.Count -eq 0) {
    try { [void]$roots.Add((Get-ItemProperty 'HKLM:\SOFTWARE\WOW6432Node\Valve\Steam' -ErrorAction Stop).InstallPath) } catch { }
  }
  $libs = New-Object System.Collections.ArrayList
  foreach ($root in $roots) {
    if (-not $root) { continue }
    $root = ([string]$root) -replace '/', '\'
    $root = $root -replace '\\\\', '\'
    [void]$libs.Add($root)
    $vdf = Join-Path $root 'steamapps\libraryfolders.vdf'
    if (Test-Path -LiteralPath $vdf) {
      $text = [System.IO.File]::ReadAllText($vdf, [System.Text.Encoding]::UTF8)
      foreach ($m in [regex]::Matches($text, '"path"\s+"([^"]+)"')) {
        $libPath = $m.Groups[1].Value -replace '/', '\'
        $libPath = $libPath -replace '\\\\', '\'
        [void]$libs.Add($libPath)
      }
    }
  }
  foreach ($lib in ($libs | Select-Object -Unique)) {
    $manifest = Join-Path $lib ('steamapps\appmanifest_' + $appId + '.acf')
    if (-not (Test-Path -LiteralPath $manifest)) { continue }
    $text = [System.IO.File]::ReadAllText($manifest, [System.Text.Encoding]::UTF8)
    $name = ''
    if ($text -match '"name"\s+"([^"]+)"') { $name = $Matches[1] }
    $dir = ''
    if ($text -match '"installdir"\s+"([^"]+)"') { $dir = $Matches[1] }
    if (-not $dir) { continue }
    $base = Join-Path $lib ('steamapps\common\' + $dir)
    if (-not (Test-Path -LiteralPath $base)) { continue }
    $candidates = Get-ChildItem -LiteralPath $base -Filter '*.exe' -Recurse -Depth 4 -File -ErrorAction SilentlyContinue |
      Where-Object {
        $_.Name -notmatch '(?i)unins|install|setup|redist|vcredist|dxsetup|dotnet|directx|crash|report|helper|launcher|updat|patch|config|anticheat|easyanticheat|battleye|eac|activation|touchup|cleanup|overlay|benchmark|trial|demo|vconsole|vrprism|vrserver|vrcompositor|vrmonitor|vrstartup|vrdashboard|vrwebhelper|vrpathreg|vrsetup' -and
        $_.FullName -notmatch '(?i)\\(__installer|__overlay|support|tools|redist|steamworks)(\\|$)'
      }
    $key = ($dir -replace '[^A-Za-z0-9]', '').ToLowerInvariant()
    $scored = foreach ($c in $candidates) {
      $stem = ($c.BaseName -replace '[^A-Za-z0-9]', '').ToLowerInvariant()
      $score = 0
      if ($key -and $stem -and ($key.Contains($stem) -or $stem.Contains($key))) { $score += 1000 }
      $depth = ($c.DirectoryName.Substring($base.Length).Split('\') | Where-Object { $_ }).Count
      $score -= $depth * 10
      $score += [math]::Min(9, [int]($c.Length / 100MB))
      [pscustomobject]@{ score = $score; path = $c.FullName }
    }
    $best = $scored | Sort-Object score -Descending | Select-Object -First 1
    return [pscustomobject]@{ name = $name; path = $(if ($best) { $best.path } else { '' }); dir = $dir }
  }
  return $null
}

try {
  $raw = $raw.Trim().Trim('"')
  if (-not $raw) { throw 'empty path' }
  if ($raw -match '(?i)^file://') { $raw = ([uri]$raw).LocalPath }
  $resolved = $raw
  $kind = 'exe'
  $name = ''
  $platformId = ''

  if ($raw -match '(?i)^steam://') {
    $kind = 'url'
  } elseif (Test-Path -LiteralPath $raw) {
    $ext = [System.IO.Path]::GetExtension($raw).ToLowerInvariant()
    if ($ext -eq '.lnk') {
      $shell = New-Object -ComObject WScript.Shell
      $link = $shell.CreateShortcut($raw)
      $resolved = [string]$link.TargetPath
      $kind = 'lnk'
      if (-not $resolved) { throw 'shortcut has no target' }
    } elseif ($ext -eq '.url') {
      $text = [System.IO.File]::ReadAllText($raw, [System.Text.Encoding]::UTF8)
      if ($text -match '(?im)^\s*URL\s*=\s*(.+?)\s*$') { $result.url = $Matches[1] }
      $kind = 'url'
      $resolved = [string]$result.url
      if (-not $resolved) { throw 'shortcut has no URL' }
      if ($resolved -match '(?i)^file://') { $resolved = ([uri]$resolved).LocalPath }
      elseif ($resolved -notmatch '(?i)^steam://') { throw ('unsupported url: ' + $resolved) }
    } elseif ($ext -ne '.exe') {
      throw ('unsupported file: ' + $ext)
    }
  } else {
    throw ('not found: ' + $raw)
  }

  if ($resolved -match '(?i)^steam://(?:rungameid|run)/(\d+)') {
    $appId = $Matches[1]
    $steam = Find-SteamGame $appId
    if (-not $steam) { throw ('steam app not found: ' + $appId) }
    $resolved = [string]$steam.path
    $name = [string]$steam.name
    $platformId = 'steam'
    if (-not $resolved) { throw ('steam game has no exe: ' + [string]$steam.dir) }
  }

  if (-not (Test-Path -LiteralPath $resolved)) { throw ('target missing: ' + $resolved) }
  $item = Get-Item -LiteralPath $resolved
  if ([System.IO.Path]::GetExtension($item.FullName).ToLowerInvariant() -ne '.exe') {
    throw ('target is not an exe: ' + $item.FullName)
  }
  $resolved = $item.FullName

  if (-not $name) {
    $info = $item.VersionInfo
    foreach ($candidate in @($info.ProductName, $info.FileDescription)) {
      $value = ([string]$candidate).Trim()
      if ($value -and $value -notmatch '(?i)^(microsoft|windows)') { $name = $value; break }
    }
  }
  if (-not $name) { $name = [System.IO.Path]::GetFileNameWithoutExtension($resolved) }

  if (-not $platformId) {
    if ($resolved -match '(?i)\\steamapps\\common\\') { $platformId = 'steam' }
    elseif ($resolved -match '(?i)\\epic games\\') { $platformId = 'epic' }
    elseif ($resolved -match '(?i)\\gog games\\') { $platformId = 'gog' }
  }

  $result.ok = $true
  $result.path = $resolved
  $result.name = $name
  $result.kind = $kind
  $result.platformId = $platformId
} catch {
  $result.ok = $false
  $result.path = ''
  $result.name = ''
  $result.warning = $_.Exception.Message
}

$json = $result | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText($outPath, $json, (New-Object System.Text.UTF8Encoding($false)))
`

const scriptCache = {}
const scriptWrites = {}

export async function runScript(name, source, args, timeoutMs) {
  let target = scriptCache[name]
  if (!target) {
    target = join(DIR, name)
    // Several calls can arrive together (a multi-file drop); write the script
    // once, before any of them starts reading it.
    if (!scriptWrites[name]) {
      scriptWrites[name] = mkdir(DIR, { recursive: true })
        .then(() => writeFile(target, source, 'utf8'))
        .then(() => {
          scriptCache[name] = target
        })
    }
    await scriptWrites[name]
  }
  return new Promise((resolve) => {
    execFile(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', target].concat(args || []),
      { windowsHide: true, timeout: timeoutMs || 60000, maxBuffer: 16 * 1024 * 1024 },
      (error, stdout) => {
        resolve(error ? '' : String(stdout).trim())
      }
    )
  })
}

let electronApp

async function loadElectronApp() {
  if (electronApp !== undefined) return electronApp
  try {
    const electron = await import('electron')
    electronApp = electron && electron.app ? electron.app : null
  } catch {
    electronApp = null
  }
  return electronApp
}

export async function iconFromFile(file) {
  if (!file || !/\.(exe|lnk|ico)$/i.test(file)) return null

  // PowerShell asks the shell for the icon's own largest frame (16–256) and
  // keeps its alpha channel; Electron's getFileIcon caps at 32px, so it only
  // runs as a fallback when the shell extractor yields nothing.
  const value = await runScript('gt-icon.ps1', ICON_SCRIPT, [file])
  if (value) return 'data:image/png;base64,' + value

  const app = await loadElectronApp()
  if (app && typeof app.getFileIcon === 'function') {
    try {
      const image = await app.getFileIcon(file, { size: 'large' })
      if (image && typeof image.isEmpty === 'function' && !image.isEmpty()) {
        return 'data:image/png;base64,' + image.toPNG().toString('base64')
      }
    } catch {
      /* no icon available */
    }
  }

  return null
}

export async function browseExecutables(dir) {
  const out = []
  const walk = async (base, depth) => {
    let entries = []
    try {
      entries = await readdir(base, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (out.length >= 80) return
      const full = join(base, entry.name)
      if (entry.isDirectory()) {
        if (depth > 0) await walk(full, depth - 1)
        continue
      }
      if (!entry.isFile() || !/\.exe$/i.test(entry.name)) continue
      let size = 0
      try {
        size = (await stat(full)).size
      } catch {
        size = 0
      }
      out.push({ name: entry.name, path: full, size })
    }
  }
  if (!dir) return out
  await walk(dir, 2)
  out.sort((a, b) => b.size - a.size)
  return out.slice(0, 60)
}

let jsonCallCounter = 0

/**
 * Run a script that writes UTF-8 JSON to a file instead of stdout, then read it
 * back. stdout would be encoded with the console code page (GBK on Chinese
 * Windows) and Node decodes it as UTF-8, which mangles non-ASCII paths.
 */
export async function runJsonScript(name, source, args, timeoutMs) {
  await mkdir(DIR, { recursive: true })
  jsonCallCounter += 1
  const out = join(DIR, 'ps-out-' + String(process.pid) + '-' + String(jsonCallCounter) + '-' + name.replace(/\W+/g, '-') + '.json')
  try {
    await rm(out, { force: true })
  } catch {
    /* nothing to clean */
  }
  await runScript(name, source, (args || []).concat([out]), timeoutMs)
  let text = ''
  try {
    text = await readFile(out, 'utf8')
  } catch {
    text = ''
  }
  try {
    await rm(out, { force: true })
  } catch {
    /* nothing to clean */
  }
  if (!text) return null
  try {
    return JSON.parse(text.replace(/^\uFEFF/, ''))
  } catch {
    return null
  }
}

/** Resolve a dropped/picked launch file to its game exe (`null` on failure). */
export async function resolveGamePath(target) {
  const value = String(target || '').trim()
  if (!value) return null
  return runJsonScript('gt-resolve.ps1', RESOLVE_SCRIPT, [value])
}

export function pickFileViaDialog() {
  // Browsing folders can easily take minutes; the default 60 s cap would kill
  // the dialog mid-navigation.
  return runJsonScript('gt-pick.ps1', PICK_SCRIPT, [], 300000).then((payload) => (payload && payload.path ? payload.path : null))
}
