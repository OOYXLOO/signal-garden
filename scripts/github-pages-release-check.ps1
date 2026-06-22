param(
  [string]$RepoUrl = "https://github.com/OOYXLOO/signal-garden.git",
  [string]$PublicAppUrl = "https://ooyxloo.github.io/signal-garden/",
  [string]$Day = (Get-Date -Format "yyyy-MM-dd"),
  [switch]$SetOrigin,
  [switch]$Push,
  [switch]$PublicAudit,
  [switch]$SkipChecks,
  [switch]$AllowDirty
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

function Invoke-Checked {
  param(
    [string]$FilePath,
    [string[]]$Arguments = @()
  )
  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $FilePath $($Arguments -join ' ')"
  }
}

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message"
}

Write-Step "Signal Garden release preflight"
$branch = (& git branch --show-current).Trim()
if (-not $branch) {
  throw "Could not determine the current Git branch."
}

$status = & git status --short
if ($status -and -not $AllowDirty) {
  Write-Host $status
  throw "Working tree is not clean. Commit or stash changes, or rerun with -AllowDirty for a local dry run."
}

if (-not $SkipChecks) {
  Write-Step "Running local quality checks"
  Invoke-Checked "npm" @("test")
  Invoke-Checked "npm" @("run", "check")
  Invoke-Checked "npm" @("run", "build:all")
  Invoke-Checked "npm" @("run", "audit:local")
  Invoke-Checked "npm" @("run", "audit:devvit")
  Invoke-Checked "npm" @("run", "audit:pages")
  Invoke-Checked "npm" @("run", "audit:submission")
  Invoke-Checked "npm" @("audit", "--audit-level=moderate")
} else {
  Write-Step "Skipping quality checks by request"
}

$origin = ""
try {
  $origin = (& git remote get-url origin 2>$null).Trim()
} catch {
  $origin = ""
}

if (-not $origin) {
  if ($SetOrigin) {
    Write-Step "Adding origin remote"
    Invoke-Checked "git" @("remote", "add", "origin", $RepoUrl)
    $origin = $RepoUrl
  } else {
    Write-Host "No origin remote is configured. Rerun with -SetOrigin after the repository exists:"
    Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/github-pages-release-check.ps1 -SetOrigin"
  }
} else {
  Write-Host "Origin remote: $origin"
}

if ($Push) {
  if (-not $origin) {
    throw "Cannot push because origin is not configured. Rerun with -SetOrigin -Push after the repository exists."
  }
  Write-Step "Pushing current branch"
  Invoke-Checked "git" @("push", "-u", "origin", $branch)
} else {
  Write-Step "Push not requested"
  Write-Host "To push after the repository exists, rerun with:"
  Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/github-pages-release-check.ps1 -SetOrigin -Push"
}

if ($PublicAudit) {
  Write-Step "Auditing public app URL"
  Invoke-Checked "npm" @("run", "audit:public", "--", "--base-url", $PublicAppUrl, "--day", $Day)
} else {
  Write-Step "Public URL audit not requested"
  Write-Host "After GitHub Pages is live, run:"
  Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/github-pages-release-check.ps1 -PublicAudit"
}

Write-Step "Release preflight complete"
Write-Host "Branch: $branch"
Write-Host "Public app URL: $PublicAppUrl"
Write-Host "Sample route URL: $($PublicAppUrl)?day=$Day&sample=1"
