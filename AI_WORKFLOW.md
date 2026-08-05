# Flujo obligatorio para agentes de IA

Esta política se aplica a Codex, Claude, Gemini, Copilot, Cursor y cualquier otro agente o LLM que analice o modifique este repositorio.

## Regla principal

Antes de modificar archivos, el agente debe abrir una orden de trabajo estándar:

```bash
bash tools/llm-workflow.sh status
bash tools/llm-workflow.sh start --agent <nombre-del-agente> --objective "<objetivo concreto>"
```

Agregar `--structural` cuando el trabajo cambie arquitectura, módulos, dependencias principales, puentes TypeScript/Android, reproducción, navegación o flujos centrales.

El comando `start` debe ejecutarse antes de cualquier edición. Automáticamente:

- activa las guardas Git del repositorio;
- crea una orden de trabajo externa al checkout;
- guarda estado Git, patches binarios, ramas, worktrees e historial;
- crea y verifica un bundle Git;
- archiva los untracked recuperables;
- registra versión y estado de CodeGraph;
- genera un manifiesto SHA-256.

## Investigación

Cuando CodeGraph esté disponible, usarlo antes de recorrer masivamente archivos. Registrar símbolos, callers, callees, rutas, dependencias, puentes nativos e impacto:

```bash
bash tools/llm-workflow.sh note "Hallazgo y decisión técnica."
```

El índice orienta la investigación, pero no sustituye la lectura del código, el diff, las pruebas, el typecheck, el lint ni la compilación.

## Pruebas y compilaciones

Ejecutar comandos verificables mediante el registrador estándar:

```bash
bash tools/llm-workflow.sh run -- <comando> <argumentos>
```

Para expresiones de shell complejas:

```bash
bash tools/llm-workflow.sh run -- bash -lc '<comando complejo>'
```

Cada ejecución conserva comando, salida completa, fecha y código de salida dentro de la orden activa.

## Checkpoints

```bash
bash tools/llm-workflow.sh checkpoint "descripción"
```

## Commits y publicación

- No crear commits, hacer push, abrir o cerrar PR, ni fusionar sin autorización expresa del usuario.
- No usar `--no-verify`.
- No desactivar ni modificar `core.hooksPath` para eludir el flujo.
- Todo commit autorizado requiere una orden activa. Los hooks agregan automáticamente los trailers `Work-Order` y `Agent`.

## Cierre

```bash
bash tools/llm-workflow.sh finish "resumen del resultado"
```

El cierre captura el estado final, actualiza CodeGraph cuando existe, exporta el estado disponible a Obsidian y recalcula el manifiesto.

Si el trabajo se cancela o bloquea:

```bash
bash tools/llm-workflow.sh abort "motivo"
```

Nunca dejar una orden activa sin cerrarla o abortarla.

## Ubicación de evidencia

Por defecto:

```text
$HOME/.local/state/llm-work/<repositorio>/<fecha-objetivo>/
```

Puede cambiarse con `LLM_WORK_ROOT`. `.codegraph/`, SQLite, WAL y cachés siguen siendo artefactos regenerables y no son fuentes de verdad.
