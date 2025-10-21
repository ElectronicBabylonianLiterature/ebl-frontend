FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Install Node.js 16.13.1 using nvm and Yarn 1.x
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
