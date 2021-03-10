FROM node:14

ENV NODE_ENV production
WORKDIR /usr/src/ebl-frontend

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

COPY static.json  ./
COPY tsconfig.json  ./
COPY .env.local ./.env
COPY public ./public
COPY src ./src

RUN yarn build

EXPOSE 5000
RUN yarn global add serve
CMD ["serve", "-s", "build"]