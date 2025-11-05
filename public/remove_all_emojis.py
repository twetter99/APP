# -*- coding: utf-8 -*-
import re

input_file = r"C:\Mac\Home\Documents\LENOVO1\clientes\UTE\Facturaciones\2025\WEB UTE\APP\public\index.html"
output_file = r"C:\Mac\Home\Documents\LENOVO1\clientes\UTE\Facturaciones\2025\WEB UTE\APP\public\index_NO_EMOJI.html"

print("Eliminando TODOS los emojis y caracteres corruptos...")

with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

cleaned_lines = []
emoji_count = 0

for line in lines:
    original = line
    # Eliminar cualquier caracter que no sea:
    # - ASCII básico (0x20-0x7E)
    # - Acentos españoles y ñ (À-ÿ)
    # - Espacios, tabs, newlines
    # - Algunos símbolos útiles: € • – — " " ' '
    cleaned = re.sub(r'[^\x20-\x7E\xC0-\xFF\n\r\t€•–—""''‚„…]', '', line)
    
    # Eliminar secuencias corruptas específicas
    cleaned = re.sub(r'ðŸ[^\s]*', '', cleaned)  # Cualquier emoji corrupto que empiece con ðŸ
    cleaned = re.sub(r'â€[^\s]', '', cleaned)   # Símbolos corruptos
    
    if cleaned != original:
        emoji_count += 1
    
    cleaned_lines.append(cleaned)

with open(output_file, 'w', encoding='utf-8') as f:
    f.writelines(cleaned_lines)

print(f"Procesadas {len(lines)} líneas")
print(f"Líneas con emojis eliminados: {emoji_count}")
print(f"Archivo guardado: {output_file}")
print("\nProximos pasos:")
print("  mv index.html index_BACKUP_emoji.html")
print("  mv index_NO_EMOJI.html index.html")
print("  firebase deploy --only hosting")
