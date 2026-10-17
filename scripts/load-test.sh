#!/usr/bin/env bash
set -euo pipefail

url="${1:-http://localhost:8000/api/tickets/stats}"
requests="${2:-300}"
parallelism="${3:-15}"

for value in "$requests" "$parallelism"; do
  if [[ ! "$value" =~ ^[0-9]+$ ]] || ((value < 1)); then
    echo "Request count and parallelism must be positive integers." >&2
    exit 2
  fi
done

seq "$requests" | xargs -P "$parallelism" -I '{}' \
  curl --fail --silent --show-error "$url" -o /dev/null
printf 'Completed %s requests to %s (up to %s at a time)\n' \
  "$requests" "$url" "$parallelism"
