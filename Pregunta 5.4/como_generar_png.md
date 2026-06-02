# Cómo convertir los .puml a PNG

## Opción 1 — VS Code (más fácil, sin instalar nada extra)

1. Abre VS Code.
2. Ve a **Extensiones** (Ctrl+Shift+X) y busca **PlantUML** (autor: jebbs). Instálala.
3. Abre cualquier archivo `.puml` de esta carpeta.
4. Presiona **Alt+D** para ver la vista previa en vivo.
5. Para exportar a PNG: abre la paleta de comandos con **Ctrl+Shift+P**,
   escribe `PlantUML: Export Current Diagram` y selecciona **png**.
6. El archivo PNG se guarda en la misma carpeta.

> La extensión usa el servidor online de PlantUML por defecto, así que no necesitas Java.

---

## Opción 2 — Online (sin instalar nada)

1. Ve a: https://www.plantuml.com/plantuml/uml/
2. Copia y pega el contenido de cada archivo `.puml`.
3. El diagrama se genera automáticamente.
4. Haz clic derecho sobre la imagen → **Guardar imagen como** → PNG.

---

## Opción 3 — CLI con JAR (para generar todos de una vez)

### Requisitos
- Java 8 o superior instalado (`java -version` para verificar).
- Descargar `plantuml.jar` desde https://plantuml.com/download

### Comando para generar todos los PNG de la carpeta

```powershell
# Desde la carpeta "Pregunta 5.4":
java -jar plantuml.jar *.puml

# Si plantuml.jar está en otra ruta:
java -jar C:\ruta\plantuml.jar *.puml
```

Esto genera un `.png` por cada `.puml` en la misma carpeta.

### Para un solo archivo:
```powershell
java -jar plantuml.jar 01_decorator.puml
```
