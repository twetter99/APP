# Script de verificación de Firebase PIVTrack
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Verificacion Firebase PIVTrack    " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar proyecto activo
Write-Host "[1/4] Verificando proyecto activo..." -ForegroundColor Yellow
firebase use
Write-Host ""

# Verificar archivos críticos
Write-Host "[2/4] Verificando archivos criticos..." -ForegroundColor Yellow
$files = @("firebaseConfig.js", "firebase.json", "firestore.rules", "public\index.html", "db\queries.js")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  OK $file" -ForegroundColor Green
    } else {
        Write-Host "  FALTA $file" -ForegroundColor Red
    }
}
Write-Host ""

# URLs importantes
Write-Host "[3/4] URLs del proyecto:" -ForegroundColor Yellow
Write-Host "  App: https://piv-manager.web.app" -ForegroundColor Cyan
Write-Host "  Console: https://console.firebase.google.com/project/piv-manager" -ForegroundColor Cyan
Write-Host "  Auth: https://console.firebase.google.com/project/piv-manager/authentication" -ForegroundColor Cyan
Write-Host ""

Write-Host "[4/4] Proximo paso:" -ForegroundColor Yellow
Write-Host "  Lee INSTRUCCIONES_AUTH.md para habilitar Google Auth" -ForegroundColor White
Write-Host ""
