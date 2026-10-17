#!/usr/bin/env bash
set -euo pipefail

if (($# == 0)); then
  echo "Usage: scripts/run-evidence.sh command [args...]" >&2
  exit 2
fi

mkdir -p docs/evidence/logs
timestamp="$(date +%Y%m%d-%H%M%S)"
identity="$(id -un)@$(hostname -s)"
log_file="docs/evidence/logs/${timestamp}.log"

{
  printf '[terminal: %s]\n' "$identity"
  printf '$'
  printf ' %q' "$@"
  printf '\n'
} | tee "$log_file"

"$@" 2>&1 | tee -a "$log_file"
