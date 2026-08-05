# GEMINI.md

Follow `AGENTS.md` and `AI_WORKFLOW.md` as mandatory sources of truth.

Before any edit:

```bash
bash tools/llm-workflow.sh status
bash tools/llm-workflow.sh start --agent gemini --objective "<objective>"
```

Use `--structural` when appropriate. Use CodeGraph before broad searches, record findings with `note`, run tests/builds through `run --`, never use `--no-verify`, and always `finish` or `abort`. Commit, push and merge require express user authorization.

Prefer minimal changes and verify TypeScript, Android bridges, playback, navigation, privacy and dependency impact before completion.
