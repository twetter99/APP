# -*- coding: utf-8 -*-
import os
import time
from datetime import datetime

BASE_DIR = r"C:\Mac\Home\Documents\LENOVO1\clientes\UTE\Facturaciones\2025\WEB UTE\APP\public"
INPUT_FILE = os.path.join(BASE_DIR, "index.html")
OUTPUT_FILE = os.path.join(BASE_DIR, "index_FIXED.html")
BACKUP_FILE = os.path.join(BASE_DIR, f"index_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html")

print("=" * 70)
print("CORRECTOR DE CODIFICACION UTF-8")
print("=" * 70)
print(f"\nDirectorio: {BASE_DIR}")
print(f"Entrada: {os.path.basename(INPUT_FILE)}")
print(f"Salida: {os.path.basename(OUTPUT_FILE)}")

if not os.path.exists(INPUT_FILE):
    print(f"\nERROR: No se encontro {INPUT_FILE}")
    exit(1)

# Pares de reemplazo (old -> new)
FIXES = [
    # Emojis corruptos principales
    ("ðŸ"‹", "📋"),
    ("ðŸ'¾", "💾"),
    ("ðŸ"", "📄"),
    ("ðŸ"µ", "🔵"),
    ("ðŸ"´", "🔴"),
    ("ðŸ'°", "💰"),
    ("ðŸ'¤", "👤"),
    # Simbolos especiales
    ("–¼", "▼"),
    ("½", "💾"),
    # Palabras con acentos corruptos
    ("histñrico", "histórico"),
    ("Histñrico", "Histórico"),
    ("Gestiñ³n", "Gestión"),
    ("gestiñ³n", "gestión"),
    ("aplicaciñ³n", "aplicación"),
    ("Aplicaciñ³n", "Aplicación"),
    ("sesiñ³n", "sesión"),
    ("Sesiñ³n", "Sesión"),
    ("Facturaciñ³n", "Facturación"),
    ("facturaciñ³n", "facturación"),
    ("Comparaciñn", "Comparación"),
    ("comparaciñn", "comparación"),
    ("CONFIGURACIñ³N", "CONFIGURACIÓN"),
    ("configuraciñ³n", "configuración"),
    ("Configuraciñ³n", "Configuración"),
    ("reinstalaciñ³n", "reinstalación"),
    ("Reinstalaciñ³n", "Reinstalación"),
    ("variaciñ³n", "variación"),
    ("Variaciñ³n", "Variación"),
    ("Cñdigo", "Código"),
    ("cñdigo", "código"),
    ("añ±o", "año"),
    ("Añ±o", "Año"),
    ("añ±adir", "añadir"),
    ("Añ±adir", "Añadir"),
    ("instalaciñ³n", "instalación"),
    ("Instalaciñ³n", "Instalación"),
    # Secuencias de 2 caracteres
    ("ñ³", "ó"),
    ("ñ±", "ñ"),
    ("ñ­", "í"),
    ("ñº", "ú"),
    ("ñ¡", "á"),
    ("ñ©", "é"),
]

start_time = time.time()

print("\nCreando backup...")
with open(INPUT_FILE, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Backup: {os.path.basename(BACKUP_FILE)}")

print(f"\nLeyendo archivo ({len(content):,} caracteres)...")

counts = {}
total = 0
for old, new in FIXES:
    n = content.count(old)
    if n > 0:
        content = content.replace(old, new)
        counts[old] = n
        total += n

print(f"\nGuardando corregido...")
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

elapsed = time.time() - start_time

print("\n" + "=" * 70)
print("ESTADISTICAS")
print("=" * 70)
print(f"\nTotal reemplazos: {total}")
print(f"Tiempo: {elapsed:.2f}s")
print(f"Tamaño final: {len(content):,} caracteres")

if counts:
    print("\nTop 15 reemplazos:")
    for old, cnt in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:15]:
        print(f"  '{old}': {cnt}x")

print("\n" + "=" * 70)
print("COMPLETADO")
print("=" * 70)
print(f"\nArchivos:")
print(f"  - {os.path.basename(OUTPUT_FILE)}")
print(f"  - {os.path.basename(BACKUP_FILE)}")
print(f"\nProximos pasos:")
print(f"  1. Verificar {os.path.basename(OUTPUT_FILE)}")
print(f"  2. Renombrar index.html -> index_OLD.html")
print(f"  3. Renombrar index_FIXED.html -> index.html")
print(f"  4. firebase deploy --only hosting")
