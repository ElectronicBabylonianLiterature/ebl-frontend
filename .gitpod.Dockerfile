FROM gitpod/workspace-full

RUN brew tap heroku/brew
RUN brew install heroku

# Install custom tools, runtime, etc. using apt-get
# For example, the command below would install "bastet" - a command line tetris clone:
#
# RUN apt-get update \
#    && apt-get install -y bastet \
#    && apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*
#
# More information: https://www.gitpod.io/docs/42_config_docker/

RUN bash -c ". .nvm/nvm.sh \
    && nvm install 16 \
    && nvm use 16 \
    && nvm alias default 16"

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix

RUN export PATH="$(yarn global bin):$PATH"
RUN yarn global add serve
