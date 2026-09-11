#!/usr/bin/env bash
set -Eeuo pipefail

readonly CODEGRAPH_PIN="0.9.6"
readonly SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
readonly REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null || true)"

export CODEGRAPH_TELEMETRY=0
export DO_NOT_TRACK=1
export PATH="$HOME/.local/bin:$PATH"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

on_error() {
  local rc=$?
  printf 'ERROR: command failed (rc=%s) at line %s: %s\n' \
    "$rc" "${BASH_LINENO[0]:-?}" "${BASH_COMMAND:-?}" >&2
  exit "$rc"
}
trap on_error ERR

usage() {
  cat <<'USAGE'
Usage: tools/knowledge-graph.sh <command>

Commands:
  install    Install pinned CodeGraph and register MCP integrations.
  index      Build or rebuild the local CodeGraph index.
  sync       Incrementally synchronize CodeGraph.
  status     Print installation and local index status.
  obsidian   Export a status note to the Engineering-KB vault.
  all        Run install, index, status and obsidian.

Optional environment:
  OBSIDIAN_VAULT=/absolute/path/to/Engineering-KB
USAGE
}

require_repo() {
  [[ -n "$REPO_ROOT" ]] || fail "the script is not inside a Git repository"
  [[ -f "$REPO_ROOT/package.json" ]] || fail "package.json not found in $REPO_ROOT"
  grep -Eq '"name"[[:space:]]*:[[:space:]]*"vega"' "$REPO_ROOT/package.json" \
    || fail "repository does not match vega-app"

  case "$REPO_ROOT" in
    /sdcard/*|/storage/emulated/*|/mnt/media_rw/*)
      fail "move the checkout to Debian's native filesystem before indexing: $REPO_ROOT"
      ;;
  esac
}

require_linux() {
  [[ "$(uname -s)" == "Linux" ]] || fail "this integration targets Debian/Linux"
  case "$(uname -m)" in
    aarch64|arm64|x86_64|amd64) ;;
    *) fail "unsupported architecture: $(uname -m)" ;;
  esac
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required command: $1"
}

install_codegraph() {
  require_linux
  require_command curl

  local current=""
  if command -v codegraph >/dev/null 2>&1; then
    current="$(codegraph --version 2>/dev/null | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || true)"
  fi

  if [[ "$current" != "$CODEGRAPH_PIN" ]]; then
    local tmp
    tmp="$(mktemp)"
    curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh -o "$tmp"
    CODEGRAPH_VERSION="v$CODEGRAPH_PIN" sh "$tmp"
    rm -f "$tmp"
    export PATH="$HOME/.local/bin:$PATH"
  fi

  require_command codegraph
  codegraph install --target=claude,codex,gemini --location=global --yes --no-permissions
  printf 'Installed CodeGraph %s.\n' "$CODEGRAPH_PIN"
}

index_codegraph() {
  require_command codegraph
  if [[ -d "$REPO_ROOT/.codegraph" ]]; then
    codegraph index "$REPO_ROOT" --force --quiet
  else
    (
      cd "$REPO_ROOT"
      codegraph init --index
    )
  fi
}

resolve_vault() {
  if [[ -n "${OBSIDIAN_VAULT:-}" ]]; then
    printf '%s\n' "$OBSIDIAN_VAULT"
    return
  fi

  local candidate
  for candidate in \
    /storage/emulated/0/Documents/Engineering-KB \
    /sdcard/Documents/Engineering-KB \
    "$HOME/Engineering-KB"; do
    if [[ -d "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return
    fi
  done

  printf '%s\n' "$HOME/Engineering-KB"
}

export_obsidian() {
  require_command codegraph

  local vault project_dir commit branch generated
  vault="$(resolve_vault)"
  project_dir="$vault/Projects/Vega"
  commit="$(git -C "$REPO_ROOT" rev-parse HEAD)"
  branch="$(git -C "$REPO_ROOT" branch --show-current)"
  generated="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

  mkdir -p "$project_dir"
  codegraph status "$REPO_ROOT" > "$project_dir/CodeGraph Status.txt"

  cat > "$project_dir/Project Status.md" <<NOTE
---
project: Vega
repository: joselofarias-byte/vega-app
branch: "$branch"
commit: "$commit"
generated_utc: "$generated"
---

# Vega

- [[Architecture/Knowledge Graphs]]
- CodeGraph status: [[CodeGraph Status.txt]]

## Refresh

\`\`\`bash
bash tools/knowledge-graph.sh sync
bash tools/knowledge-graph.sh obsidian
\`\`\`
NOTE

  printf 'Obsidian export written to %s\n' "$project_dir"
}

show_status() {
  require_command codegraph
  printf 'Repository: %s\n' "$REPO_ROOT"
  printf 'CodeGraph: %s\n' "$(codegraph --version 2>/dev/null || printf unknown)"
  codegraph status "$REPO_ROOT"
}

main() {
  require_repo
  case "${1:-}" in
    install) install_codegraph ;;
    index) index_codegraph ;;
    sync) require_command codegraph; codegraph sync "$REPO_ROOT" ;;
    status) show_status ;;
    obsidian) export_obsidian ;;
    all)
      install_codegraph
      index_codegraph
      show_status
      export_obsidian
      ;;
    -h|--help|help|'') usage ;;
    *) usage >&2; fail "unknown command: $1" ;;
  esac
}

main "$@"
