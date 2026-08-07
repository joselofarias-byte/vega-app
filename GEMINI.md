# GEMINI.md

Follow `START-HERE.md`, `AGENTS.md` and `AI_WORKFLOW.md` as mandatory sources of truth.

Before broad analysis or edits:

```bash
bash tools/system-docs.sh summary
bash tools/system-docs.sh doctor
```

If `SWARM_ROLE` is set, read `$SWARM_ROLE_PROMPT` and continue that master order without opening another one.

For normal work:

```bash
bash tools/work.sh start --agent gemini --objective "<objective>"
```

For work that justifies independent implementation/review:

```bash
bash tools/swarm.sh start --objective "<objective>"
```

Use `--structural` when appropriate. Use CodeGraph before broad searches, record findings with `tools/work.sh note`, run tests/builds through `tools/work.sh run --`, never use `--no-verify`, and always close or abort through the same front door. Commit, push, merge and opening/closing PRs require express user authorization.

`llm-workflow.sh` and `swarm-workflow.sh` are internal engines; wrappers automatically preserve system snapshots, persistent history and the Obsidian view.

Prefer minimal changes and verify TypeScript, Android bridges, playback, navigation, privacy and dependency impact before completion.
