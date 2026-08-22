# Instrucciones obligatorias para agentes

Esta política se aplica a Codex, Claude, ChatGPT, Gemini, Meta Muse Code, Copilot, Cursor y cualquier otro agente de programación.

Antes de analizar o modificar el repositorio:

1. leer [`START-HERE.md`](START-HERE.md);
2. leer [`AI_WORKFLOW.md`](AI_WORKFLOW.md);
3. ejecutar:

```bash
bash tools/system-docs.sh summary
bash tools/system-docs.sh doctor
```

Si `SWARM_ROLE` y `SWARM_ROLE_PROMPT` están definidos, el agente ya pertenece a una orden maestra: debe leer el archivo indicado por `SWARM_ROLE_PROMPT` y no abrir otra orden.

Para trabajo normal de un solo agente usar el front door autodocumentado:

```bash
bash tools/work.sh start --agent <agent-name> --objective "<objective>"
```

Para trabajo complejo que justifique implementación y revisión independientes:

```bash
bash tools/swarm.sh start --objective "<objective>"
```

Agregar `--structural` para cambios de arquitectura, módulos, puentes TypeScript/Android, reproducción, navegación, dependencias o flujos centrales.

`tools/llm-workflow.sh` y `tools/swarm-workflow.sh` son motores internos estables. No iniciarlos directamente para trabajo nuevo salvo que se estén reparando los wrappers. `tools/work.sh` y `tools/swarm.sh` agregan snapshots, historial persistente y publicación a Obsidian.

Usar CodeGraph antes de búsquedas amplias, registrar hallazgos con `tools/work.sh note`, ejecutar pruebas/builds mediante `tools/work.sh run --`, no usar `--no-verify` y cerrar o abortar siempre mediante el mismo front door que abrió la orden. Commit, push, merge y apertura/cierre de PR requieren autorización expresa del usuario.

Prioridades del proyecto:

1. Funcionamiento correcto.
2. Privacidad y seguridad.
3. Estabilidad de reproducción y fuentes.
4. Compatibilidad Android.
5. Mantenibilidad.
6. Simplicidad.

Antes de terminar, revisar el diff, tests, typecheck/lint, compilación pertinente y comportamiento funcional. CodeGraph orienta el análisis, pero no sustituye esas verificaciones.
