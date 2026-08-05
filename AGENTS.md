# Instrucciones obligatorias para agentes

Esta política se aplica a Codex, Claude, ChatGPT, Gemini, Copilot, Cursor y cualquier otro agente de programación.

Leer y cumplir [`AI_WORKFLOW.md`](AI_WORKFLOW.md) antes de analizar o modificar el repositorio.

Antes de cualquier edición:

```bash
bash tools/llm-workflow.sh status
bash tools/llm-workflow.sh start --agent <agent-name> --objective "<objective>"
```

Agregar `--structural` para cambios de arquitectura, módulos, puentes TypeScript/Android, reproducción, navegación, dependencias o flujos centrales.

Usar CodeGraph antes de búsquedas amplias, registrar hallazgos con `note`, ejecutar pruebas y builds mediante `run --`, no usar `--no-verify` y cerrar o abortar siempre la orden. Commit, push y merge requieren autorización expresa del usuario.

Prioridades del proyecto:

1. Funcionamiento correcto.
2. Privacidad y seguridad.
3. Estabilidad de reproducción y fuentes.
4. Compatibilidad Android.
5. Mantenibilidad.
6. Simplicidad.

Antes de terminar, revisar el diff, tests, typecheck/lint, compilación pertinente y comportamiento funcional. CodeGraph orienta el análisis, pero no sustituye esas verificaciones.
