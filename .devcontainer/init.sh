#!/bin/bash
set -e

ensure_env_local_permissions() {
    chmod u+rw,go+r .env.local 2>/dev/null || sudo chmod u+rw,go+r .env.local
}

test -f .env.local || cp .env.test .env.local
ensure_env_local_permissions

injected_keys=()

while IFS= read -r template_line || [ -n "$template_line" ]; do
    case "$template_line" in
        ''|\#*)
            continue
            ;;
        *=*)
            key=${template_line%%=*}
            template_value=${template_line#*=}
            secret_value=$(printenv "$key" || true)

            if [ -z "$secret_value" ]; then
                continue
            fi

            current_line=$(grep -m1 "^${key}=" .env.local || true)
            if [ -z "$current_line" ]; then
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

if [ ${#injected_keys[@]} -gt 0 ]; then
    printf 'Injected Codespaces secrets into .env.local: %s\n' "$(IFS=', '; echo "${injected_keys[*]}")"
else
    echo 'No Codespaces secrets found — .env.local uses placeholder values from .env.test'
fi
