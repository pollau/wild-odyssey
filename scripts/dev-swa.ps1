# Lance l'emulateur Azure Static Web Apps (site Astro + API Functions) en local.
#
# Pourquoi ce wrapper : les Azure Functions Core Tools refusent Node > 22 LTS.
# Si un Node 22 portable est present sur la machine, il est prepose au PATH de
# CE process uniquement : le Node global du systeme n'est jamais modifie.
#
# Node portable attendu : %LOCALAPPDATA%\wild-odyssey-tools\node-v22.x-win-x64
# (un simple zip de nodejs.org decompresse, aucun installeur)

$toolsDir = Join-Path $env:LOCALAPPDATA "wild-odyssey-tools"
$portable = Get-ChildItem -Path $toolsDir -Directory -Filter "node-v22*" -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending | Select-Object -First 1

if ($portable -and (Test-Path (Join-Path $portable.FullName "node.exe"))) {
    $env:Path = "$($portable.FullName);$env:Path"
    $v = & (Join-Path $portable.FullName "node.exe") --version
    Write-Host "dev-swa: Node portable $v utilise pour cette session (global inchange)" -ForegroundColor Green
} else {
    $v = node --version
    Write-Host "dev-swa: pas de Node portable dans $toolsDir, utilisation du Node du PATH ($v)." -ForegroundColor Yellow
    Write-Host "dev-swa: si le lancement echoue, les Functions Core Tools requierent Node 18/20/22." -ForegroundColor Yellow
}

$swa = Join-Path $PSScriptRoot "..\node_modules\.bin\swa.ps1"
& $swa start http://localhost:4321 --run "npm run dev" --api-location api
