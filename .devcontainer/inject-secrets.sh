#!/bin/bash
# Runs inside the dev container (postCreateCommand).
# Injects Codespaces secrets into .env.local and appends any keys present in
# .env.test that are missing from .env.local.
set -e

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
                echo "${template_line}" >> .env.local
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
