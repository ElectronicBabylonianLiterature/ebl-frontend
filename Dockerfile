FROM node:20-alpine AS build

ENV NODE_ENV=production
WORKDIR /usr/src/ebl-frontend

# Install build dependencies for canvas
RUN apk add --no-cache \
	python3 \
	make \
	g++ \
	cairo-dev \
	jpeg-dev \
	pango-dev \
	giflib-dev \
	pixman-dev
ENV PYTHON=/usr/bin/python3
RUN ln -sf /usr/bin/python3 /usr/bin/python

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

COPY package.json ./
COPY patches ./patches
COPY yarn.lock ./
ENV NODE_ENV=development
ENV YARN_PRODUCTION=false
RUN yarn install --frozen-lockfile

COPY .eslintrc.json  ./
COPY craco.config.js ./
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

ENV NODE_ENV=production
ENV BABEL_ENV=production
RUN yarn build


FROM node:20-alpine

EXPOSE 5000
RUN npm install -g serve@13.0.2
COPY --from=build /usr/src/ebl-frontend/build /usr/src/ebl-frontend/build
CMD ["serve", "-s", "/usr/src/ebl-frontend/build", "--listen", "5000"]
