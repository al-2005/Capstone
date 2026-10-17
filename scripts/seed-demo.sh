#!/usr/bin/env bash
set -euo pipefail

base="${BASE:-http://localhost:8000}"
if ! curl --fail --silent --show-error "$base/ready" >/dev/null; then
  echo "Helpdesk API is not ready at $base" >&2
  exit 1
fi

create_ticket() {
  local subject="$1" description="$2" category="$3" priority="$4" requester="$5"
  curl --fail --silent --show-error \
    -H 'Content-Type: application/json' \
    -d "{\"subject\":\"$subject\",\"description\":\"$description\",\"category\":\"$category\",\"priority\":\"$priority\",\"requester\":\"$requester\"}" \
    "$base/api/tickets"
  printf '\n'
}

create_ticket \
  "Classroom projector not connecting" \
  "The display in room 204 is not connecting to the lecture laptop." \
  "Classroom" "high" "Sample Student"
create_ticket \
  "Wi-Fi drops in library" \
  "Wireless connectivity drops repeatedly on the second floor." \
  "IT" "urgent" "Sample Student"
create_ticket \
  "Request a replacement access card" \
  "The campus access card stopped working at the residence entrance." \
  "Facilities" "normal" "Campus Resident"
