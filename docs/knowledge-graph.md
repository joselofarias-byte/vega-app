# Code intelligence

This repository uses CodeGraph as a local symbol, call, dependency and change-impact index for coding agents. The generated SQLite index is excluded from Git.

## Commands

```bash
bash tools/knowledge-graph.sh install
bash tools/knowledge-graph.sh index
bash tools/knowledge-graph.sh status
bash tools/knowledge-graph.sh obsidian
```

For routine work:

```bash
bash tools/knowledge-graph.sh sync
```

The checkout must be on Debian's native filesystem. Do not create the SQLite index on `/sdcard` or `/storage/emulated`.
