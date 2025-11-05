# -*- coding: utf-8 -*-
import os
import re

input_file = r"C:\Mac\Home\Documents\LENOVO1\clientes\UTE\Facturaciones\2025\WEB UTE\APP\public\index.html"
output_file = r"C:\Mac\Home\Documents\LENOVO1\clientes\UTE\Facturaciones\2025\WEB UTE\APP\public\index_FIXED2.html"

print("Leyendo archivo...")
with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

print(f"Tamaño original: {len(content):,} caracteres")

# Definir reemplazos usando códigos de bytes exactos para emojis corruptos
# Los emojis UTF-8 mal interpretados como latin-1
fixes = {
    # Emojis corruptos comunes (representaci贸n incorrecta de UTF-8)
    '\ud83d\udccb': '📋',  # clipboard
    '\ud83d\udcbe': '💾',  # floppy disk
    '\ud83d\udcc4': '📄',  # page facing up
    '\ud83d\udd35': '🔵',  # blue circle
    '\ud83d\udd34': '🔴',  # red circle
    '\ud83d\udcb0': '💰',  # money bag
    '\ud83d\udc64': '👤',  # bust in silhouette
}

# Primero intentamos detectar y arreglar secuencias de bytes mal interpretadas
count = 0
for bad, good in fixes.items():
    n = content.count(bad)
    if n > 0:
        content = content.replace(bad, good)
        count += n
        print(f"  {bad!r} -> {good}: {n}x")

# Reemplazos adicionales por patr贸n de texto visible corrupto
text_fixes = [
    ('Exportar a Excel', '💾 Exportar a Excel'),  # agregar emoji si falta
]

for pattern, replacement in text_fixes:
    # Solo reemplazar si no tiene ya un emoji
    if re.search(r'>\s*' + re.escape(pattern), content):
        content = re.sub(r'(>[^<]*?)' + re.escape(pattern), r'\1' + replacement, content)
        print(f"  Agregado emoji a '{pattern}'")

print(f"\nTotal de correcciones: {count}")
print(f"Tamaño final: {len(content):,} caracteres")

print("Guardando archivo corregido...")
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Archivo guardado: {os.path.basename(output_file)}")
print("\nProximos pasos:")
print("  1. Verificar index_FIXED2.html")
print("  2. mv index.html index_OLD3.html")
print("  3. mv index_FIXED2.html index.html")
print("  4. firebase deploy --only hosting")
