FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Install Node.js 16.x and Yarn
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends curl ca-certificates gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_16.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends nodejs \
    && npm install -g yarn \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

RUN su vscode -c "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash" \
    && su vscode -c ". ~/.nvm/nvm.sh && nvm install 16.13.1 && nvm use 16.13.1 && nvm alias default 16.13.1" \
    && su vscode -c ". ~/.nvm/nvm.sh && npm install -g yarn@1 && yarn global add serve"

# Ensure nvm and yarn global bin are available in all shells
RUN echo 'export NVM_DIR="$HOME/.nvm"' >> /home/vscode/.bashrc \
    && echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"' >> /home/vscode/.bashrc \
    && echo 'nvm use default &>/dev/null' >> /home/vscode/.bashrc \
    && echo 'export PATH="$HOME/.yarn/bin:$PATH"' >> /home/vscode/.bashrc

# Install Heroku CLI
RUN curl https://cli-assets.heroku.com/install.sh | sh
