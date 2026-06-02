# Dev Container Configuration

This directory contains the development container configuration for the EBL Frontend project.

## Files

- `devcontainer.json` – Main dev container configuration
- `Dockerfile` – Container image definition (Node 20 + ggshield)
- `inject-secrets.sh` – Post-create script that runs inside the container to inject Codespaces secrets and sync missing keys
- `README.md` – This file

## Environment Variables

The project reads configuration from `.env.local` at the repository root. This file is
gitignored (Create React App convention) and must not be committed.

### Setup

1. **Automatic Setup**: Environment configuration happens in two phases:
   - **Before container build** (`initializeCommand`): Creates `.env.local` from `.env.test` if it does not already exist. This step is shell-agnostic and works on all host platforms.
   - **After container build** (`postCreateCommand`): Runs `inject-secrets.sh` inside the container. This script:
     - Injects any [Codespaces secrets](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-secrets-for-your-codespaces) whose names match keys in `.env.test`, but only if the current `.env.local` value still matches the placeholder.
     - Appends any keys present in `.env.test` but missing from `.env.local`, ensuring your environment stays in sync when new variables are introduced.

2. **Update Values**: Edit `.env.local` with your actual credentials for:
   - Auth0 configuration (domain, client ID, audience)
   - eBL API URL
   - Sentry DSN
   - Contact emails
   - Google Analytics tracking ID
   - GitGuardian API key (for pre-commit secret scanning)

### Security

- `.env.local` is in `.gitignore` and will never be committed
- `.env.test` contains only placeholder values and is committed to the repository
- Never commit actual credentials to version control
