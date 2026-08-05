# Manifiesto de respaldo — inteligencia de código

## Principio

El índice de CodeGraph se deriva del código y se puede reconstruir. El respaldo recuperable debe priorizar Git, parches, archivos untracked relevantes y evidencia textual.

## Contenido obligatorio del respaldo Git

- estado del repositorio;
- diff unstaged binario;
- diff staged binario;
- ramas y upstreams;
- worktrees;
- historial reciente;
- bundle Git completo;
- inventario de untracked;
- manifiesto SHA-256.

## Evidencia adicional recomendada

Guardar un archivo `code-intelligence.txt` con una captura equivalente a:

```bash
{
  date -Iseconds
  printf 'repository=%s\n' "$(git rev-parse --show-toplevel)"
  printf 'branch=%s\n' "$(git branch --show-current)"
  printf 'commit=%s\n' "$(git rev-parse HEAD)"
  printf 'codegraph_version='; codegraph --version || true
  codegraph status "$(git rev-parse --show-toplevel)" || true
  printf 'vault=%s\n' '/storage/emulated/0/Documents/Engineering-KB/Projects/Vega'
} > code-intelligence.txt
```

## Exclusiones recomendadas

Excluir de TBM y de otros respaldos de archivos:

```text
.codegraph/
```

También excluir bases SQLite, archivos `-wal`, `-shm` y cachés generadas. Estas exclusiones no afectan la recuperación porque el índice se regenera mediante:

```bash
bash tools/knowledge-graph.sh index
bash tools/knowledge-graph.sh obsidian
```

## Restauración

1. restaurar o clonar el repositorio desde bundle/remoto;
2. aplicar staged y unstaged patches;
3. restaurar untracked relevantes;
4. verificar rama y commit;
5. validar el entorno de Debian;
6. reconstruir CodeGraph sólo cuando vuelva a ser necesario.

## Regla

No considerar `.codegraph/` como fuente de verdad. La fuente de verdad es el repositorio Git y la evidencia de la orden de trabajo.
