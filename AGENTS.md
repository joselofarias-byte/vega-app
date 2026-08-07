# Instrucciones obligatorias para agentes

Esta política se aplica a Codex, Claude, ChatGPT, Gemini, Meta Muse Code, Copilot, Cursor y cualquier otro agente de programación.

Leer y cumplir [`AI_WORKFLOW.md`](AI_WORKFLOW.md) antes de analizar o modificar el repositorio.

Si `SWARM_ROLE` y `SWARM_ROLE_PROMPT` están definidos, el agente ya pertenece a una orden maestra: debe leer el archivo indicado por `SWARM_ROLE_PROMPT` y no abrir otra orden.

Para trabajo normal de un solo agente:

```bash
bash tools/llm-workflow.sh status
bash tools/llm-workflow.sh start --agent <agent-name> --objective "<objective>"
```

Para trabajo complejo que justifique implementación y revisión independientes:

```bash
bash tools/swarm-workflow.sh start --objective "<objective>"
```

Agregar `--structural` para cambios de arquitectura, módulos, puentes TypeScript/Android, reproducción, navegación, dependencias o flujos centrales.

Usar CodeGraph antes de búsquedas amplias, registrar hallazgos con `note`, ejecutar pruebas y builds mediante `run --`, no usar `--no-verify` y cerrar o abortar siempre mediante el mismo flujo que abrió la orden. Commit, push y merge requieren autorización expresa del usuario.

Prioridades del proyecto:

1. Funcionamiento correcto.
2. Privacidad y seguridad.
3. Estabilidad de reproducción y fuentes.
4. Compatibilidad Android.
5. Mantenibilidad.
6. Simplicidad.

Antes de terminar, revisar el diff, tests, typecheck/lint, compilación pertinente y comportamiento funcional. CodeGraph orienta el análisis, pero no sustituye esas verificaciones.
