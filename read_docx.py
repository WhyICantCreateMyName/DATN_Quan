import zipfile
import xml.etree.ElementTree as ET
import sys
import os
try:
    file_path = r"e:\DATN Quân\Nghiệp vụ.docx"
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)
        
    z = zipfile.ZipFile(file_path)
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    lines = []
    for p in tree.findall('.//w:p', ns):
        nodes = p.findall('.//w:t', ns)
        if nodes:
            lines.append(''.join(node.text for node in nodes if node.text))
    
    # Write output to text file to avoid encoding issues on powershell console
    out_path = r"e:\DATN Quân\Nghiệp_vụ.txt"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write('\n'.join(lines))
    print(f"Extracted to {out_path}")
    
except Exception as e:
    print(f"Error: {e}")
