#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
lock_file="$repo_root/.git/full-test.lock"
metadata_file="$repo_root/.git/full-test.lock.meta"
full_test_timeout="${FULL_TEST_TIMEOUT:-60m}"
full_test_command="${FULL_TEST_COMMAND:-CI=true yarn test --coverage --forceExit --detectOpenHandles --watch=false}"
runner_pid="$$"
child_pid=""

find_workspace_test_processes() {
  local candidate_pid candidate_cwd candidate_cmd

  while IFS= read -r candidate_pid; do
    [[ -z "$candidate_pid" ]] && continue
    [[ ! -d "/proc/$candidate_pid" ]] && continue

    candidate_cwd="$(readlink -f "/proc/$candidate_pid/cwd" 2>/dev/null || true)"
    [[ "$candidate_cwd" != "$repo_root" ]] && continue

    candidate_cmd="$(tr '\0' ' ' < "/proc/$candidate_pid/cmdline" 2>/dev/null || true)"
    [[ -z "$candidate_cmd" ]] && continue

    printf '%s\t%s\n' "$candidate_pid" "$candidate_cmd"
  done < <(pgrep -f 'craco test|react-scripts test|jest' 2>/dev/null || true)
}

write_metadata() {
  cat > "$metadata_file" <<EOF
started_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
host=$(hostname)
repo=$repo_root
runner_pid=$runner_pid
command=$full_test_command
timeout=$full_test_timeout
EOF
}

cleanup() {
  local exit_code=$?

  trap - EXIT INT TERM

  if [[ -n "$child_pid" ]] && kill -0 "$child_pid" 2>/dev/null; then
    kill -TERM "-$child_pid" 2>/dev/null || true
    sleep 2
    kill -KILL "-$child_pid" 2>/dev/null || true
  fi

  rm -f "$metadata_file"
  exit "$exit_code"
}

exec 9>"$lock_file"

if ! flock -n 9; then
  echo "Another full test run is already active for this repository." >&2
  if [[ -f "$metadata_file" ]]; then
    cat "$metadata_file" >&2
  fi
  exit 1
fi

existing_processes="$(find_workspace_test_processes)"
if [[ -n "$existing_processes" ]]; then
  echo "Refusing to start a full test run because matching workspace test processes already exist without the singleton lock:" >&2
  printf '%s\n' "$existing_processes" >&2
  exit 1
fi

write_metadata
trap cleanup EXIT INT TERM

setsid timeout --foreground --signal=TERM --kill-after=30s "$full_test_timeout" bash -lc "cd \"$repo_root\" && exec $full_test_command" &
child_pid=$!

cat >> "$metadata_file" <<EOF
child_pid=$child_pid
child_pgid=$child_pid
EOF

wait "$child_pid"