# Inteligencia de código

Este repositorio usa **CodeGraph** como índice local de símbolos, llamadas, dependencias e impacto de cambios para agentes de programación. La base SQLite generada queda fuera de Git.

## Flujo automático estándar

Toda tarea realizada por un LLM debe seguir [`AI_WORKFLOW.md`](../AI_WORKFLOW.md). No se copian plantillas manualmente: `tools/llm-workflow.sh` crea la orden, el respaldo y la evidencia.

```bash
bash tools/llm-workflow.sh start --agent <llm> --objective "<objetivo>"
bash tools/llm-workflow.sh note "<hallazgo>"
bash tools/llm-workflow.sh run -- <prueba-o-build>
bash tools/llm-workflow.sh finish "<resultado>"
```

Usar `--structural` en `start` para cambios de arquitectura, puentes TypeScript/Android, reproducción, navegación, dependencias o flujos centrales. Un commit autorizado queda bloqueado si no existe una orden activa y recibe automáticamente trailers que identifican la orden y el agente.

## Uso recomendado

Usar CodeGraph antes de modificar:

- flujo de búsqueda y selección de fuentes;
- reproducción;
- navegación compleja;
- módulos nativos Android;
- puentes entre TypeScript y Kotlin/Java;
- autenticación, telemetría o servicios compartidos;
- componentes reutilizados por varias pantallas.

Consultas típicas para Claude, Codex o Gemini:

```text
Usá CodeGraph antes de leer archivos. Trazá el flujo desde la búsqueda hasta la reproducción.
```

```text
Usá CodeGraph para identificar callers, callees y archivos afectados si eliminamos una dependencia de telemetría.
```

```text
Localizá con CodeGraph los puentes entre TypeScript y los módulos Android, y después verificá sólo los archivos relevantes.
```

CodeGraph orienta la investigación; no reemplaza la lectura del diff, las pruebas, el typecheck, el lint ni la compilación.

## Obsidian

Usar el vault para conservar:

- hallazgos y decisiones;
- riesgos y dependencias;
- estado textual del índice;
- referencias a ramas, commits, builds y respaldos;
- conclusiones de auditorías.

Obsidian no sustituye Git, los bundles ni los parches de recuperación.

## Integración con órdenes de trabajo

La orden automática registra:

1. repositorio, rama y commit base;
2. objetivo y agente responsable;
3. estado de CodeGraph;
4. notas de símbolos, rutas, dependencias, puentes e impacto;
5. pruebas y compilaciones con salida y código de retorno;
6. checkpoints previos a commits;
7. resultado final, commit alcanzado y estado del árbol.

La plantilla [`work-order-template.md`](work-order-template.md) queda como referencia humana.

## Integración con respaldos

`start` genera automáticamente:

- `status.txt`;
- `unstaged.patch` y `staged.patch` binarios;
- ramas, worktrees e historial;
- bundle Git completo y verificado;
- archivo recuperable de untracked;
- versión y estado de CodeGraph;
- manifiesto SHA-256 integral.

No se respaldan como fuentes de verdad `.codegraph/`, SQLite, WAL ni cachés. Son regenerables. Guía: [`backup-manifest.md`](backup-manifest.md).

## Comandos directos de índices

```bash
bash tools/knowledge-graph.sh install
bash tools/knowledge-graph.sh index
bash tools/knowledge-graph.sh status
bash tools/knowledge-graph.sh obsidian
```

Para actualizar manualmente:

```bash
bash tools/knowledge-graph.sh sync
bash tools/knowledge-graph.sh obsidian
```

Normalmente el cierre de `llm-workflow.sh` hace la actualización correspondiente. El checkout debe estar en el sistema de archivos nativo de Debian. No crear el índice SQLite en `/sdcard` ni `/storage/emulated`.
