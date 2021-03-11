FROM node:14-alpine as build

ENV NODE_ENV production
WORKDIR /usr/src/ebl-frontend

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json  ./
COPY .env ./
COPY public ./public
COPY src ./src

ARG REACT_APP_AUTH0_DOMAIN
ARG REACT_APP_AUTH0_CLIENT_ID
ARG REACT_APP_AUTH0_REDIRECT_URI
ARG REACT_APP_AUTH0_RETURN_TO
ARG REACT_APP_AUTH0_AUDIENCE
ARG REACT_APP_DICTIONARY_API_URL
ARG REACT_APP_SENTRY_DSN

RUN yarn build


FROM node:14-alpine

EXPOSE 5000
RUN yarn global add serve
COPY --from=build /usr/src/ebl-frontend /usr/src/ebl-frontend
CMD ["serve", "-s", "/usr/src/ebl-frontend/build"]
