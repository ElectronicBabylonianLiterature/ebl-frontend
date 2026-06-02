# TASK-733 Fix Plan — PR #733: devcontainer-fix

**Date:** 2026-06-02 (updated with Round 2 findings)
**Based on findings:** TASK-733-review.md
**Scope:** 2 files: `.devcontainer/inject-secrets.sh`, `scripts/register-codespaces-secrets.sh`

---

## Round 1 — Status

All round-1 fixes implemented in commit `aa75c35` (local, not yet pushed):

| Finding                           | Status                                                             |
| --------------------------------- | ------------------------------------------------------------------ |
| F-01 Secret injection lifecycle   | ✅ Fixed — injection moved to `postCreateCommand` inside container |
| F-02 Permissions + sudo           | ✅ Fixed — `chmod 600`, non-fatal warning when root-owned          |
| F-03 bash hardcoded               | ✅ Fixed — array-form `initializeCommand` with `sh`                |
| F-04 Missing key append           | ✅ Fixed — missing keys appended with log message                  |
| F-05 grep -F anchor               | ⚠️ Reverted — `-F` breaks `^` anchor; `grep -m1` retained          |
| F-06 Register script upload scope | ✅ Fixed — filtered to `.env.test` keys only                       |

---

## Round 2 — Status

All round-2 fixes implemented. Awaiting user permission to commit.

| Finding                 | Status                             |
| ----------------------- | ---------------------------------- |
| A-01 awk backslash      | ✅ Fixed — `ENVIRON["AWK_SECRET"]` |
| A-02 trailing newline   | ✅ Fixed — `printf '\n%s\n'`       |
| A-03 mktemp leak        | ✅ Fixed — `_tmp_file` + EXIT trap |
| A-04 placeholder upload | ✅ Fixed — skip with warning       |

`yarn lint` ✅ `yarn tsc` ✅ Manual end-to-end test ✅ (9 keys/9 lines/7 injected/no duplicates)

---

### Fix A-01 — `awk -v new=` backslash corruption (`inject-secrets.sh`)

**Root cause:** awk's `-v` option processes backslash escape sequences at assignment time. `secret_value='abc\ndef'` becomes two lines in the output.

**Current code (broken):**

```sh
awk -v key="$key" -v old="$template_value" -v new="$secret_value" '
    BEGIN { replaced = 0 }
    {
        if (!replaced && index($0, key "=") == 1) {
            line_value = substr($0, length(key) + 2)
            if (line_value == old) {
                print key "=" new
                ...
```

**Fixed code:**

```sh
AWK_SECRET="$secret_value" awk -v key="$key" -v old="$template_value" '
    BEGIN { replaced = 0; new_val = ENVIRON["AWK_SECRET"] }
    {
        if (!replaced && index($0, key "=") == 1) {
            line_value = substr($0, length(key) + 2)
            if (line_value == old) {
                print key "=" new_val
                ...
```

`ENVIRON["AWK_SECRET"]` reads the value from the process environment at runtime — no backslash interpretation.

---

### Fix A-02 — Append fuses with last line when no trailing newline (`inject-secrets.sh`)

**Root cause:** `.env.test` has no trailing newline on its last line. A copy of it (`.env.local`) also has none. `echo "KEY=value" >> .env.local` appends without inserting a newline first, producing `LAST_KEY=valueNEW_KEY=placeholder` on a single line.

**Current code (broken):**

```sh
if [ -z "$current_line" ]; then
    echo "${template_line}" >> .env.local
```

**Fixed code:**

```sh
if [ -z "$current_line" ]; then
    printf '\n%s\n' "${template_line}" >> .env.local
```

`printf '\n%s\n'` unconditionally inserts a newline before the key (harmless blank line if the file already ended with a newline) and a newline after it.

---

### Fix A-03 — `mktemp` temp file leaks on failure (`inject-secrets.sh`)

**Root cause:** `tmp_file=$(mktemp)` is called inside the loop. With `set -e`, any failure after this point exits the script immediately, leaving the temp file on disk.

**Fix:** Declare a single temp-file variable at script scope and register an `EXIT` trap:

```sh
_tmp_file=""
trap 'rm -f "$_tmp_file"' EXIT
```

Then replace `tmp_file=$(mktemp)` with `_tmp_file=$(mktemp)` and `"$tmp_file"` with `"$_tmp_file"` throughout.

After `mv "$_tmp_file" .env.local` succeeds, clear the variable so the trap doesn't try to remove the now-moved file:

```sh
mv "$_tmp_file" .env.local
_tmp_file=""
```

---

### Fix A-04 — Register script uploads placeholder values silently (`register-codespaces-secrets.sh`)

**Root cause:** No check is made to warn when a value in `.env.local` still matches the placeholder in `.env.test`.

**Fix:** Inside the filtering loop, after finding the value line, compare it against the template value and print a warning if they match:

```sh
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    ''|\#*) continue ;;
    *=*)
      key="${line%%=*}"
      template_value="${line#*=}"
      value_line=$(grep -m1 "^${key}=" "$ENV_FILE" || true)
      if [ -n "$value_line" ]; then
        actual_value="${value_line#*=}"
        if [ "$actual_value" = "$template_value" ]; then
          echo "Warning: $key still has its placeholder value — skipping." >&2
          continue
        fi
        echo "$value_line" >> "$FILTERED_FILE"
      fi
      ;;
  esac
done < .env.test
```

Skipping placeholder values rather than uploading them is safer than a warning-only approach.

---

## Implementation order

1. Fix `inject-secrets.sh` (A-01 + A-02 + A-03 together — all in the same file)
2. Fix `register-codespaces-secrets.sh` (A-04)
3. Run `yarn lint` and `yarn tsc`
4. Manual test: run `inject-secrets.sh`, verify output and `.env.local` content
5. Commit
6. Push to origin

---

## Overview

The 6 findings split into two groups:

| Group                      | Findings               | Root cause                                                     |
| -------------------------- | ---------------------- | -------------------------------------------------------------- |
| **Architecture**           | F-01, F-03             | `initializeCommand` is the wrong lifecycle phase for this work |
| **Correctness / Security** | F-02, F-04, F-05, F-06 | Bugs and hardening gaps in the shell scripts                   |

The architecture fix drives all other changes, so it is addressed first.

---

## Fix 1 — Restructure the lifecycle (addresses F-01 + F-03)

### Problem recap

`initializeCommand` runs **on the host machine, before the container is built**.  
Two consequences:

- Codespaces secrets are **not yet exported** to the host environment at that point, so `printenv` finds nothing → injection silently does nothing.
- The command is `bash .devcontainer/init.sh`. Hosts without `bash` in PATH (Windows, minimal Linux) **fail before the container is ever created**.

### Proposed split

Divide the work across two lifecycle phases:

| Phase               | Where it runs                      | What it does                                                                                  |
| ------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `initializeCommand` | Host (before build)                | Only creates `.env.local` from `.env.test` if absent — a plain file copy, no bash, no secrets |
| `postCreateCommand` | Inside the container (after build) | Injects Codespaces secrets + syncs missing keys                                               |

This is safe because:

- The file-copy operation requires only POSIX `sh` and `cp` — available on every host.
- All secret injection runs inside the container, where bash is guaranteed by the Dockerfile and Codespaces secrets are reliably present as environment variables.

### Changes

**`devcontainer.json`**

Change `initializeCommand` from a string to an **array** (the array form bypasses the host shell entirely — `sh -c` is invoked directly):

```json
"initializeCommand": ["sh", "-c", "test -f .env.local || cp .env.test .env.local"],
"postCreateCommand": "git config --global core.autocrlf input && git config --global core.eol lf && git config --global core.safecrlf true && yarn install && bash .devcontainer/inject-secrets.sh",
```

Using the array form for `initializeCommand` avoids dependence on any particular shell being in the host PATH. The `sh -c` call is universally available on all POSIX-compatible hosts and on Windows via Git Bash / WSL.

**`.devcontainer/init.sh` → DELETED** (its two responsibilities are now split between `initializeCommand` inline and the new `inject-secrets.sh`).

**`.devcontainer/inject-secrets.sh` → NEW FILE** (bash, runs in container — see Fix 3 for full content).

---

## Fix 2 — Secure `.env.local` permissions (addresses F-02)

### Problem recap

```sh
chmod u+rw,go+r .env.local 2>/dev/null || sudo chmod u+rw,go+r .env.local
```

- `go+r` makes the credentials file readable by **all other users** on the system.
- The `sudo` fallback can hang waiting for a password in non-interactive scripts (and with `set -e`, any failure aborts the entire setup with no useful message).

### Fix

Replace `ensure_env_local_permissions` in `inject-secrets.sh` with:

```sh
ensure_env_local_permissions() {
    chmod 600 .env.local || {
        echo "Error: could not set permissions on .env.local. Check file ownership." >&2
        exit 1
    }
}
```

`600` = owner read+write only. No sudo. Clear failure message if something goes wrong.

---

## Fix 3 — Full `inject-secrets.sh` (addresses F-01, F-02, F-04, F-05 together)

This is the complete content of the new `.devcontainer/inject-secrets.sh`.  
Each annotated block maps to the finding it resolves.

```bash
#!/bin/bash
# Runs inside the dev container (postCreateCommand).
# Injects Codespaces secrets into .env.local and syncs any keys newly added
# to .env.test that are missing from .env.local.
set -e

# F-02: owner-only permissions, no sudo
ensure_env_local_permissions() {
    chmod 600 .env.local || {
        echo "Error: could not set permissions on .env.local." >&2
        exit 1
    }
}

ensure_env_local_permissions

injected_keys=()
missing_keys=()

while IFS= read -r template_line || [ -n "$template_line" ]; do
    case "$template_line" in
        ''|\#*)
            continue
            ;;
        *=*)
            key=${template_line%%=*}
            template_value=${template_line#*=}

            # F-04: detect keys absent from .env.local and append them
            # F-05: use grep -F so key is treated as a fixed string, not a regex
            current_line=$(grep -Fm1 "^${key}=" .env.local || true)
            if [ -z "$current_line" ]; then
                echo "${template_line}" >> .env.local
                missing_keys+=("$key")
                # Fall through: also try to inject the secret for the newly appended key
                current_line="${template_line}"
            fi

            # F-01: secret injection runs here, inside the container, where
            # Codespaces secrets are reliably available as environment variables
            secret_value=$(printenv "$key" || true)
            if [ -z "$secret_value" ]; then
                continue
            fi

            current_value=${current_line#*=}
            if [ "$current_value" != "$template_value" ]; then
                continue
            fi

            tmp_file=$(mktemp)
            awk -v key="$key" -v old="$template_value" -v new="$secret_value" '
                BEGIN { replaced = 0 }
                {
                    if (!replaced && index($0, key "=") == 1) {
                        line_value = substr($0, length(key) + 2)
                        if (line_value == old) {
                            print key "=" new
                            replaced = 1
                            next
                        }
                    }
                    print
                }
            ' .env.local > "$tmp_file"
            mv "$tmp_file" .env.local
            ensure_env_local_permissions
            injected_keys+=("$key")
            ;;
    esac
done < .env.test

if [ ${#missing_keys[@]} -gt 0 ]; then
    printf 'Added missing keys to .env.local from .env.test: %s\n' \
        "$(IFS=', '; echo "${missing_keys[*]}")"
fi

if [ ${#injected_keys[@]} -gt 0 ]; then
    printf 'Injected Codespaces secrets into .env.local: %s\n' \
        "$(IFS=', '; echo "${injected_keys[*]}")"
else
    echo 'No Codespaces secrets found — .env.local uses placeholder values from .env.test'
fi
```

---

## Fix 4 — Filter `register-codespaces-secrets.sh` to `.env.test` keys only (addresses F-06)

### Problem recap

`gh secret set --env-file .env.local` uploads **every** variable in the file. A developer who has added personal variables to `.env.local` (e.g., a personal proxy, a local override) would accidentally register those as Codespaces secrets.

### Fix

Build a temporary env-file containing only the keys defined in `.env.test`, then upload that filtered file:

```bash
# Build a filtered env-file containing only keys defined in .env.test
FILTERED_FILE=$(mktemp)
trap 'rm -f "$FILTERED_FILE"' EXIT

while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
        ''|\#*) continue ;;
        *=*)
            key="${line%%=*}"
            # F-05 also: -F for fixed-string match
            value_line=$(grep -Fm1 "^${key}=" "$ENV_FILE" || true)
            if [ -n "$value_line" ]; then
                echo "$value_line" >> "$FILTERED_FILE"
            fi
            ;;
    esac
done < .env.test

echo "Registering Codespaces secrets from $ENV_FILE for $REPO ..."

gh secret set \
  --app codespaces \
  --user \
  --env-file "$FILTERED_FILE" \
  --repos "$REPO"
```

The `trap` ensures the temporary file is always cleaned up, even on error.

---

## Fix 5 — Update documentation (README + .devcontainer/README.md)

### `.devcontainer/README.md`

Update the "Automatic Setup" bullet to reflect the new two-phase flow:

> - Before the container is created, `initializeCommand` creates `.env.local` from `.env.test` if it does not already exist. This step is shell-agnostic and works on all hosts.
> - After the container is built, `postCreateCommand` runs `inject-secrets.sh` inside the container. This script injects any matching Codespaces secrets into `.env.local`, and appends any keys present in `.env.test` but missing from `.env.local`.

### `README.md` (Codespaces setup step 6)

Adjust to clarify that secrets are injected **after** container creation (not before):

> `.env.local` is created from `.env.test` before the container builds. After the container starts, Codespaces secrets matching the keys in `.env.test` are automatically injected. If no secrets are configured, open `.env.local` inside the container and fill in your credentials.

---

## File change summary

| File                                     | Action     | Reason                                                                                 |
| ---------------------------------------- | ---------- | -------------------------------------------------------------------------------------- |
| `.devcontainer/devcontainer.json`        | Modify     | Array-form `initializeCommand`; extend `postCreateCommand` to call `inject-secrets.sh` |
| `.devcontainer/init.sh`                  | **Delete** | Replaced by inline `initializeCommand` + new `inject-secrets.sh`                       |
| `.devcontainer/inject-secrets.sh`        | **Add**    | Container-side injection + missing-key sync + secure permissions                       |
| `.devcontainer/README.md`                | Modify     | Reflect two-phase lifecycle                                                            |
| `README.md`                              | Modify     | Update step 6 wording                                                                  |
| `scripts/register-codespaces-secrets.sh` | Modify     | Filter upload to `.env.test` keys only                                                 |

---

## Implementation order

1. Delete `init.sh` (unblocks renaming concerns early)
2. Add `inject-secrets.sh` (full content above)
3. Update `devcontainer.json` (both `initializeCommand` and `postCreateCommand`)
4. Fix `register-codespaces-secrets.sh`
5. Update `.devcontainer/README.md`
6. Update `README.md`

---

## Testing checklist

- [ ] Local devcontainer: open repo in VS Code → Dev Containers, verify no bash-dependency error on host
- [ ] `.env.local` created with `600` permissions
- [ ] Re-open container: existing `.env.local` values are preserved; no overwrite
- [ ] Add a new key to `.env.test`, re-run `inject-secrets.sh` manually → new key appears in `.env.local`
- [ ] With Codespaces secrets configured: verify values are injected after container creation
- [ ] `register-codespaces-secrets.sh`: add an extra key to `.env.local` not in `.env.test`, run the script, verify only `.env.test` keys appear in the uploaded secrets list
