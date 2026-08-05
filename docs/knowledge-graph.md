# Inteligencia de código

Este repositorio usa **CodeGraph** como índice local de símbolos, llamadas, dependencias e impacto de cambios para agentes de programación. La base SQLite generada queda fuera de Git.

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

CodeGraph orienta la investigación; no reemplaza la lectura del diff, las pruebas ni la compilación.

## Obsidian

Usar el vault para conservar:

- hallazgos y decisiones;
- riesgos y dependencias;
- estado textual del índice;
- referencias a ramas, commits, builds y respaldos;
- conclusiones de auditorías.

Obsidian no sustituye Git, los bundles ni los parches de recuperación.

## Integración con órdenes de trabajo

Toda orden de trabajo que use CodeGraph debe registrar:

1. repositorio, rama y commit base;
2. objetivo concreto;
3. símbolos, rutas o dependencias consultadas;
4. callers, callees e impacto relevante;
5. archivos previstos para modificar;
6. pruebas, compilación y criterios de aceptación;
7. resultado final y commit, o constancia de que no hubo commit/push.

Plantilla: [`work-order-template.md`](work-order-template.md).

## Integración con respaldos

El respaldo recuperable continúa basándose en Git:

- `status.txt`;
- `unstaged.patch`;
- `staged.patch`;
- `branches.txt`;
- `worktrees.txt`;
- `log.txt`;
- bundle Git completo;
- inventario de archivos untracked cuando corresponda;
- manifiesto SHA-256.

Agregar como evidencia liviana:

- versión de CodeGraph;
- salida de `codegraph status`;
- commit y rama usados para generar el índice;
- ruta del vault donde quedó el estado exportado.

No respaldar `.codegraph/`, bases SQLite, archivos WAL ni cachés como datos esenciales. Son regenerables.

Guía: [`backup-manifest.md`](backup-manifest.md).

## Comandos

```bash
bash tools/knowledge-graph.sh install
bash tools/knowledge-graph.sh index
bash tools/knowledge-graph.sh status
bash tools/knowledge-graph.sh obsidian
```

Para actualizar después de cambios relevantes:

```bash
bash tools/knowledge-graph.sh sync
bash tools/knowledge-graph.sh obsidian
```

El checkout debe estar en el sistema de archivos nativo de Debian. No crear el índice SQLite en `/sdcard` ni `/storage/emulated`.
