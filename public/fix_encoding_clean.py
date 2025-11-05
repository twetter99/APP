#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para corregir problemas de doble codificación UTF-8 en archivos HTML
"""

import os
import time
from datetime import datetime

def fix_encoding():
    """
    Corrige problemas de doble codificación UTF-8 en index.html
    Guarda el resultado en index_FIXED.html
    """
    
    # Configuración de rutas
    BASE_DIR = r"C:\Mac\Home\Documents\LENOVO1\clientes\UTE\Facturaciones\2025\WEB UTE\APP\public"
    INPUT_FILE = os.path.join(BASE_DIR, "index.html")
    OUTPUT_FILE = os.path.join(BASE_DIR, "index_FIXED.html")
    BACKUP_FILE = os.path.join(BASE_DIR, f"index_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html")
    
    print("=" * 70)
    print("CORRECTOR DE CODIFICACION UTF-8")
    print("=" * 70)
    print(f"\nDirectorio: {BASE_DIR}")
    print(f"Archivo de entrada: {os.path.basename(INPUT_FILE)}")
    print(f"Archivo de salida: {os.path.basename(OUTPUT_FILE)}")
    
    # Validar que el archivo existe
    if not os.path.exists(INPUT_FILE):
        print(f"\nERROR: No se encontro el archivo {INPUT_FILE}")
        return False
    
    # Reemplazos específicos (pares seguros)
    replacements = {
        # Simbolos tipograficos
        "â€"": "–",
        "â€"": "—",
        "â€¦": "…",
        "â€œ": """,
        "â€": """,
        "â€¢": "•",
        "â‚¬": "€",
        "Â¿": "¿",
        "Â¡": "¡",
        "Âº": "º",
        "Âª": "ª",
        "Â·": "·",
        "Â": "",
        
        # Vocales acentuadas
        "Ã¡": "á",
        "Ã©": "é",
        "Ã­": "í",
        "Ã³": "ó",
        "Ãº": "ú",
        "Ã±": "ñ",
        
        # Palabras específicas corruptas
        "Gestiñ³n": "Gestión",
        "gestiñ³n": "gestión",
        "aplicaciñ³n": "aplicación",
        "Aplicaciñ³n": "Aplicación",
        "sesiñ³n": "sesión",
        "Sesiñ³n": "Sesión",
        "Facturaciñ³n": "Facturación",
        "facturaciñ³n": "facturación",
        "CONFIGURACIñ³N": "CONFIGURACIÓN",
        "configuraciñ³n": "configuración",
        "Configuraciñ³n": "Configuración",
        "histñ³rico": "histórico",
        "Histñ³rico": "Histórico",
        "reinstalaciñ³n": "reinstalación",
        "Reinstalaciñ³n": "Reinstalación",
        "variaciñ³n": "variación",
        "Variaciñ³n": "Variación",
        "Cñdigo": "Código",
        "cñdigo": "código",
        "añ±o": "año",
        "Añ±o": "Año",
        "añ±adir": "añadir",
        "Añ±adir": "Añadir",
        "instalaciñ³n": "instalación",
        "Instalaciñ³n": "Instalación",
        
        # Secuencias de 2 caracteres
        "ñ³": "ó",
        "ñ±": "ñ",
        "ñ­": "í",
        "ñº": "ú",
        "ñ¡": "á",
        "ñ©": "é",
    }
    
    try:
        # Medir tiempo de ejecución
        start_time = time.time()
        
        # Crear backup automático
        print(f"\nCreando backup...")
        with open(INPUT_FILE, 'r', encoding='utf-8', errors='ignore') as f:
            original_content = f.read()
        
        with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
            f.write(original_content)
        print(f"Backup creado: {os.path.basename(BACKUP_FILE)}")
        
        # Leer archivo original
        print(f"\nLeyendo archivo original...")
        content = original_content
        original_size = len(content)
        print(f"   Tamaño: {original_size:,} caracteres")
        
        # Aplicar reemplazos
        print(f"\nAplicando {len(replacements)} reemplazos...")
        replacement_count = {}
        total_replacements = 0
        
        for old, new in replacements.items():
            count = content.count(old)
            if count > 0:
                content = content.replace(old, new)
                replacement_count[old] = count
                total_replacements += count
        
        # Guardar archivo corregido
        print(f"\nGuardando archivo corregido...")
        with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        
        # Calcular tiempo transcurrido
        elapsed_time = time.time() - start_time
        
        # Mostrar estadísticas
        print("\n" + "=" * 70)
        print("ESTADISTICAS DE CORRECCION")
        print("=" * 70)
        print(f"\nTotal de reemplazos realizados: {total_replacements}")
        print(f"Tiempo de ejecución: {elapsed_time:.2f} segundos")
        print(f"Tamaño original: {original_size:,} caracteres")
        print(f"Tamaño final: {len(content):,} caracteres")
        
        if replacement_count:
            print(f"\nDetalle de reemplazos (top 20):")
            sorted_replacements = sorted(replacement_count.items(), key=lambda x: x[1], reverse=True)[:20]
            for old, count in sorted_replacements:
                new = replacements[old]
                old_display = old[:30] + '...' if len(old) > 30 else old
                new_display = new[:30] + '...' if len(new) > 30 else new
                print(f"   '{old_display}' -> '{new_display}': {count} veces")
        
        print("\n" + "=" * 70)
        print("PROCESO COMPLETADO EXITOSAMENTE")
        print("=" * 70)
        print(f"\nArchivos generados:")
        print(f"   - {os.path.basename(OUTPUT_FILE)}")
        print(f"   - {os.path.basename(BACKUP_FILE)}")
        print(f"\nProximos pasos:")
        print(f"   1. Verifica que {os.path.basename(OUTPUT_FILE)} se vea correcto")
        print(f"   2. Renombra index.html a index_OLD.html")
        print(f"   3. Renombra {os.path.basename(OUTPUT_FILE)} a index.html")
        print(f"   4. Despliega con: firebase deploy --only hosting")
        
        return True
        
    except Exception as e:
        print(f"\nERROR durante el proceso:")
        print(f"   {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = fix_encoding()
    exit(0 if success else 1)
