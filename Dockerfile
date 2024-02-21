FROM node:16-alpine as build

ENV NODE_ENV production
WORKDIR /usr/src/ebl-frontend

COPY package.json ./
COPY patches ./patches
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

COPY .eslintrc.json  ./
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
ARG REACT_APP_CORRECTIONS_EMAIL
ARG REACT_APP_INFO_EMAIL
ARG REACT_APP_GA_TRACKING_ID

RUN yarn build


FROM node:16-alpine

EXPOSE 5000
RUN yarn global add serve@13.0.2
COPY --from=build /usr/src/ebl-frontend/build /usr/src/ebl-frontend/build
CMD ["serve", "-s", "/usr/src/ebl-frontend/build", "--listen", "5000"]
