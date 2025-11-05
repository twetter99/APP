# Script de correcci贸n masiva de caracteres UTF-8
$inputFile = "C:\Mac\Home\Documents\LENOVO1\clientes\UTE\Facturaciones\2025\WEB UTE\APP\public\index.html"
$outputFile = "C:\Mac\Home\Documents\LENOVO1\clientes\UTE\Facturaciones\2025\WEB UTE\APP\public\index_CORRECTED.html"

Write-Host "Leyendo archivo..."
$content = Get-Content -Path $inputFile -Raw -Encoding UTF8

# Reemplazos de emojis corruptos
$replacements = @{
    'ðŸ"‹' = '📋'
    'ðŸ'¾' = '💾'
    'ðŸ"' = '📄'
    'ðŸ"µ' = '🔵'
    'ðŸ"´' = '🔴'
    'ðŸ'°' = '💰'
    'ðŸ'¤' = '👤'
    '–¼' = '▼'
    '½' = '💾'
    '¢' = '+'
    'histñrico' = 'histórico'
    'Histñrico' = 'Histórico'
    'Comparaciñn' = 'Comparación'
    'comparaciñn' = 'comparación'
    'Facturaciñn' = 'Facturación'
    'reinstalaciñn' = 'reinstalación'
    'Reinstalaciñn' = 'Reinstalación'
}

$count = 0
foreach ($key in $replacements.Keys) {
    $oldCount = ([regex]::Matches($content, [regex]::Escape($key))).Count
    if ($oldCount -gt 0) {
        $content = $content -replace [regex]::Escape($key), $replacements[$key]
        $count += $oldCount
        Write-Host "  '$key' -> '$($replacements[$key])': $oldCount reemplazos"
    }
}

Write-Host "`nTotal de reemplazos: $count"
Write-Host "Guardando archivo corregido..."

$content | Out-File -FilePath $outputFile -Encoding UTF8 -NoNewline

Write-Host "Archivo guardado en: $outputFile"
Write-Host "`nProximos pasos:"
Write-Host "  1. Verificar index_CORRECTED.html"
Write-Host "  2. mv index.html index_OLD2.html"
Write-Host "  3. mv index_CORRECTED.html index.html"
Write-Host "  4. firebase deploy --only hosting"
