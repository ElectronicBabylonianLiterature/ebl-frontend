FROM mcr.microsoft.com/devcontainers/javascript-node:20

ARG GGSHIELD_VERSION=1.48.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/ggshield \
    && /opt/ggshield/bin/pip install --no-cache-dir "ggshield==${GGSHIELD_VERSION}" \
    && ln -sf /opt/ggshield/bin/ggshield /usr/local/bin/ggshield \
    && ggshield --version