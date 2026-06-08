# Sync wiki/ source files to GitHub Wiki (benmed00/Online-PDF-CV.wiki)
# Usage: .\scripts\sync-wiki-to-github.ps1
# Prerequisite: create the first wiki page once via GitHub UI (see wiki/Sync-Wiki.md)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path $PSScriptRoot -Parent
$WikiSrc = Join-Path $RepoRoot "wiki"
$WikiClone = Join-Path (Split-Path $RepoRoot -Parent) "Online-PDF-CV.wiki"
$WikiRemote = "https://github.com/benmed00/Online-PDF-CV.wiki.git"

Write-Host "Source:  $WikiSrc"
Write-Host "Clone:   $WikiClone"
Write-Host ""

if (-not (Test-Path $WikiSrc)) {
    throw "wiki/ folder not found at $WikiSrc"
}

# Clone existing wiki repo, or init if first-time bootstrap not done yet
if (Test-Path $WikiClone) {
    Write-Host "Updating existing wiki clone..."
    Push-Location $WikiClone
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    git fetch origin *> $null
    git checkout master *> $null
    if ($LASTEXITCODE -ne 0) { git checkout main *> $null }
    $ErrorActionPreference = $prevEap
    Pop-Location
} else {
    Write-Host "Cloning wiki repository..."
    git clone $WikiRemote $WikiClone 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERROR: Wiki git repository does not exist yet." -ForegroundColor Red
        Write-Host ""
        Write-Host "GitHub creates the wiki repo only after the FIRST page is saved in the UI:"
        Write-Host "  1. Open https://github.com/benmed00/Online-PDF-CV/wiki/_new"
        Write-Host "  2. Title: Home"
        Write-Host "  3. Add any placeholder text and click Save"
        Write-Host "  4. Re-run: .\scripts\sync-wiki-to-github.ps1"
        Write-Host ""
        exit 1
    }
}

# Copy markdown pages (exclude Sync-Wiki.md — maintainer-only)
Get-ChildItem $WikiSrc -Filter "*.md" |
    Where-Object { $_.Name -ne "Sync-Wiki.md" } |
    ForEach-Object {
        Copy-Item $_.FullName -Destination $WikiClone -Force
        Write-Host "  copied $($_.Name)"
    }

Push-Location $WikiClone
git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "Wiki is already up to date."
    Pop-Location
    exit 0
}

git commit -m "docs: sync wiki from main repository"
$branch = git branch --show-current
if (-not $branch) { git branch -M master; $branch = "master" }

Write-Host "Pushing to $WikiRemote ($branch)..."
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
git push origin $branch *> $null
$pushOk = $LASTEXITCODE -eq 0
$ErrorActionPreference = $prevEap
if (-not $pushOk) {
    Pop-Location
    throw "Push failed. Ensure you are logged in: gh auth login"
}

Pop-Location
Write-Host ""
Write-Host "Done. Wiki live at: https://github.com/benmed00/Online-PDF-CV/wiki" -ForegroundColor Green
