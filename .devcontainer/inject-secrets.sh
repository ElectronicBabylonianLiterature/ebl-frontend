#!/bin/bash
# Runs inside the dev container (postCreateCommand).
# Injects Codespaces secrets into .env.local and appends any keys present in
# .env.test that are missing from .env.local.
set -e

# A-03: single variable + EXIT trap so the temp file is always cleaned up
_tmp_file=""
trap 'rm -f "$_tmp_file"' EXIT

ensure_env_local_permissions() {
    chmod 600 .env.local 2>/dev/null || \
        echo "Warning: could not set 600 permissions on .env.local (owned by another user). Continuing." >&2
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

            current_line=$(grep -m1 "^${key}=" .env.local || true)
            if [ -z "$current_line" ]; then
                # A-02: printf guarantees a leading newline so the new key is never
                # fused with the last line of a file that has no trailing newline
                printf '\n%s\n' "${template_line}" >> .env.local
                missing_keys+=("$key")
                current_line="${template_line}"
            fi

            secret_value=$(printenv "$key" || true)
            if [ -z "$secret_value" ]; then
                continue
            fi

            current_value=${current_line#*=}
            if [ "$current_value" != "$template_value" ]; then
                continue
            fi

            # A-01: pass the secret via ENVIRON so awk never interprets backslashes
            _tmp_file=$(mktemp)
            AWK_SECRET="$secret_value" awk -v key="$key" -v old="$template_value" '
                BEGIN { replaced = 0; new_val = ENVIRON["AWK_SECRET"] }
                {
                    if (!replaced && index($0, key "=") == 1) {
                        line_value = substr($0, length(key) + 2)
                        if (line_value == old) {
                            print key "=" new_val
                            replaced = 1
                            next
                        }
                    }
                    print
                }
            ' .env.local > "$_tmp_file"
            mv "$_tmp_file" .env.local
            _tmp_file=""
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

