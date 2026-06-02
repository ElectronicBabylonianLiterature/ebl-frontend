#!/bin/bash
# Registers all variables from .env.local as user-level Codespaces secrets
# scoped to the ebl-frontend repository.
#
# Usage: bash scripts/register-codespaces-secrets.sh
#
# Prerequisites:
#   - gh CLI installed and authenticated (gh auth login)
#   - .env.local exists and contains real credential values
set -e

REPO="ElectronicBabylonianLiterature/ebl-frontend"
ENV_FILE=".env.local"

if ! command -v gh &> /dev/null; then
  echo "Error: gh CLI is not installed. See https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "Error: not authenticated. Run 'gh auth login' first." >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Create it from .env.test and fill in real values." >&2
  exit 1
fi

FILTERED_FILE=$(mktemp)
trap 'rm -f "$FILTERED_FILE"' EXIT

while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    ''|\#*) continue ;;
    *=*)
      key="${line%%=*}"
      value_line=$(grep -m1 "^${key}=" "$ENV_FILE" || true)
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

echo "Done. To verify:"
echo "  gh secret list --app codespaces --user"
