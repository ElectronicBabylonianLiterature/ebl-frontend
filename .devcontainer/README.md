# Dev Container Configuration

This directory contains the development container configuration for the EBL Frontend project.

## Files

- `devcontainer.json` – Main dev container configuration
- `Dockerfile` – Container image definition (Node 20 + ggshield)
- `init.sh` – Initialization script that runs on the Codespaces host before the container builds
- `README.md` – This file

## Environment Variables

The project reads configuration from `.env.local` at the repository root. This file is
gitignored (Create React App convention) and must not be committed.

### Setup

1. **Automatic Setup**: Before the container is created, `initializeCommand` runs
   `init.sh` on the host. This script:
   - Creates `.env.local` from `.env.test` if `.env.local` does not already exist.
   - For each key defined in `.env.test`, if a [Codespaces secret](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-secrets-for-your-codespaces)
     with the same name is available in the host environment, its value is written into
     `.env.local`, replacing the placeholder.

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
