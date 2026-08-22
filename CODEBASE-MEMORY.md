# Codebase Memory MCP — backend candidato de inteligencia de código

`DeusData/codebase-memory-mcp` se integra como **backend candidato y complementario**, no como un segundo índice obligatorio ejecutándose siempre junto a CodeGraph.

Versión fijada: **0.9.0**. Licencia upstream: **MIT**.

La versión 0.9.0 es la release estable actual verificada al integrar esta capa. No se conserva 0.8.1: upstream declara las versiones `<0.9` fuera de soporte y 0.9.0 incluye correcciones relevantes de indexado, memoria, TypeScript/JavaScript, Java/Kotlin, CLI y `detect_changes`.

## Decisión de arquitectura

### CodeGraph sigue siendo el backend primario

CodeGraph ya está validado en este entorno y continúa siendo la ruta diaria para símbolos, callers/callees, dependencias, trazado, impacto básico y MCP de agentes.

### Codebase Memory queda como candidato avanzado

Se usa cuando aporte una capacidad concreta que justifique un segundo índice temporal/local:

- búsqueda semántica local con embeddings incluidos;
- Hybrid LSP para TypeScript/JavaScript/Java/Kotlin y otros lenguajes;
- `detect_changes` con blast radius/riesgo;
- Cypher de lectura;
- búsqueda de clones/relaciones semánticas;
- arquitectura enriquecida;
- validación experimental de precisión contra CodeGraph.

No se promueve a backend primario sólo por benchmarks upstream. La promoción requiere evidencia sobre nuestros repositorios reales.

## Qué se descarta por duplicidad

Por defecto **NO** se activa auto-index de agentes, `auto_watch`, daemon compartido, configuración automática de Claude/Codex/Gemini, skills/agentes propios de Codebase Memory, `manage_adr` como segunda memoria, UI 3D como requisito ni un segundo sistema documental.

`START-HERE.md`, `AI_WORKFLOW.md`, `llm-workflow`, `system-docs`, Obsidian y CodeGraph siguen siendo canónicos.

## Integración segura

```bash
bash tools/code-intel.sh status
bash tools/code-intel.sh install-cbm
```

La instalación descarga la release **v0.9.0**, selecciona Linux ARM64/AMD64 portable, descarga `checksums.txt`, verifica SHA-256 antes de extraer, instala fuera del checkout y **no** ejecuta `curl | bash`, `codebase-memory-mcp install`, mutaciones de agentes ni cambios globales de `PATH`.

Ubicación por defecto:

```text
$HOME/.local/share/engineering-tools/codebase-memory-mcp/0.9.0/
```

## Estado y caché

Cada repositorio usa su propia caché:

```text
$HOME/.local/state/code-intel/cbm/<repo-id>/
```

El wrapper fija:

```text
CBM_ALLOWED_ROOT=<repository-root>
CBM_CACHE_DIR=<repo-specific-cache>
CBM_DIAGNOSTICS=0
CBM_LOG_LEVEL=warn
CBM_WORKERS=4
CBM_MEM_BUDGET_MB=1024
```

Los límites de workers/memoria son deliberados para Debian PRoot. El índice es regenerable y no es backup.

## Uso CLI one-shot

```bash
bash tools/code-intel.sh cbm-index
bash tools/code-intel.sh cbm get_architecture --project <project>
bash tools/code-intel.sh cbm search_graph --project <project> --name-pattern '.*Player.*'
bash tools/code-intel.sh cbm detect_changes --project <project>
```

CLI one-shot es el modo preferido: termina después de cada consulta y los logs quedan bajo `evidence/code-intel/cbm/runs/` de la orden activa.

## MCP experimental

```bash
bash tools/code-intel.sh cbm-mcp
```

Antes de iniciarlo, el wrapper fija `auto_index=false` y `auto_watch=false`; no registra el MCP globalmente.

Upstream documenta que indexado, consultas y búsqueda semántica son locales, pero después de `initialize` del MCP realiza un chequeo best-effort de nueva versión contra metadata pública de releases de GitHub. No envía código, rutas, índices, consultas ni telemetría del proyecto, pero esa conexión HTTPS existe. Por eso **CLI one-shot sigue siendo nuestro modo predeterminado**.

## Regla de selección

1. **CodeGraph primero** para trabajo diario.
2. Codebase Memory sólo para capacidad diferencial o comparación controlada.
3. Si gana repetidamente en Nightzuku/Vega, promoverlo y retirar CodeGraph mediante una migración separada.
4. No mantener dos índices obligatorios por inercia.

## Criterios para promoción

Medir en repos reales exactitud de callers/callees, resolución TypeScript/Java/Kotlin, cobertura de símbolos, `detect_changes`, búsqueda semántica, tiempos inicial/incremental, RAM pico, disco, consumo de llamadas/tokens, estabilidad Debian PRoot ARM64 y mantenimiento.

Hasta completar esa comparación, el estado es **CANDIDATE / SHADOW**, no `PRIMARY`.
