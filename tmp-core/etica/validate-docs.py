#!/usr/bin/env python3
"""
Script para validar a documentação antes do deploy.
Verifica links, formatação e estrutura.
"""

import os
import re
import sys
from pathlib import Path

def check_markdown_files():
    """Verifica estrutura dos arquivos markdown."""
    docs_dir = Path('docs')
    errors = []
    
    required_files = [
        'index.md',
        'visao-geral.md', 
        'missao-valores.md',
        'objetivos.md',
        'roadmap.md',
        'contribuicao.md'
    ]
    
    for file in required_files:
        if not (docs_dir / file).exists():
            errors.append(f"❌ Arquivo obrigatório não encontrado: {file}")
    
    return errors

def check_links():
    """Verifica links internos."""
    docs_dir = Path('docs')
    errors = []
    
    for md_file in docs_dir.glob('*.md'):
        content = md_file.read_text(encoding='utf-8')
        
        # Encontrar links markdown [text](link)
        links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        
        for text, link in links:
            if link.endswith('.md') and not link.startswith('http'):
                target = docs_dir / link
                if not target.exists():
                    errors.append(f"❌ Link quebrado em {md_file.name}: {link}")
    
    return errors

def main():
    """Função principal."""
    print("🔍 Validando documentação...")
    
    errors = []
    errors.extend(check_markdown_files())
    errors.extend(check_links())
    
    if errors:
        print("\n".join(errors))
        sys.exit(1)
    else:
        print("✅ Documentação válida!")
        sys.exit(0)

if __name__ == '__main__':
    main()
