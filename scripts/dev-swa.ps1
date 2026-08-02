# Lance l'emulateur Azure Static Web Apps (site Astro + API Functions) en local.
#
# Pourquoi ce wrapper :
#  1. Les Azure Functions Core Tools refusent Node > 22 LTS. Si un Node 22
#     portable est present, il est prepose au PATH de CE process uniquement :
#     le Node global du systeme n'est jamais modifie.
#     Emplacement attendu : %LOCALAPPDATA%\wild-odyssey-tools\node-v22.x-win-x64
#     (un simple zip de nodejs.org decompresse, aucun installeur)
#  2. Les ports sont configurables, pour faire tourner plusieurs clones du repo
#     en parallele sans collision.
#
# Ports, par ordre de priorite :
#   variable d'environnement  >  dev-ports.json (gitignore, propre au clone)  >  defaut
# Exemple de dev-ports.json a la racine du repo :
#   { "devPort": 4322, "swaPort": 4281, "apiPort": 7072 }

$ErrorActionPreference = "Stop"

# --- Node compatible avec les Functions Core Tools ---------------------------
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

# --- Ports -------------------------------------------------------------------
$cfgPath = Join-Path $PSScriptRoot "..\dev-ports.json"
$cfg = if (Test-Path $cfgPath) { Get-Content $cfgPath -Raw | ConvertFrom-Json } else { [pscustomobject]@{} }

$devPort = if ($env:WO_DEV_PORT) { $env:WO_DEV_PORT } elseif ($cfg.devPort) { $cfg.devPort } else { 4321 }
$swaPort = if ($env:WO_SWA_PORT) { $env:WO_SWA_PORT } elseif ($cfg.swaPort) { $cfg.swaPort } else { 4280 }
$apiPort = if ($env:WO_API_PORT) { $env:WO_API_PORT } elseif ($cfg.apiPort) { $cfg.apiPort } else { 7071 }

Write-Host "dev-swa: site $swaPort (a ouvrir) | astro $devPort | api $apiPort" -ForegroundColor Cyan

# --- Emulateur ---------------------------------------------------------------
$swa = Join-Path $PSScriptRoot "..\node_modules\.bin\swa.ps1"
& $swa start "http://localhost:$devPort" `
    --port $swaPort `
    --api-port $apiPort `
    --run "npm run dev -- --port $devPort" `
    --api-location api
