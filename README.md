# Electronic Babylonian Literature frontend

![Build Status](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/workflows/CI/badge.svg)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0787509d99e64ee3cb93/test_coverage)](https://codeclimate.com/github/ElectronicBabylonianLiterature/ebl-frontend/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/0787509d99e64ee3cb93/maintainability)](https://codeclimate.com/github/ElectronicBabylonianLiterature/ebl-frontend/maintainability)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4)](https://prettier.io)
[![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade/www.ebl.lmu.de?publish)](https://observatory.mozilla.org/analyze/www.ebl.lmu.de)

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). You can find the most recent version of the guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Requirements

- yarn
- Node
- Chrome (for Lighthouse)

The following services are needed to run application:

- [eBL API](https://github.com/ElectronicBabylonianLiterature/ebl-api)
- [Auth0](https://auth0.com)
- [Sentry](https://sentry.io)

### Gitpod

The project comes with a [Gitpod](https://www.gitpod.io) configuration including
select extensions. Click the button below, configure the environment variables and you are good to go.
It might be necessary to use `.env.local` instead of [the facilities provided
in Gitpod](https://www.gitpod.io/docs/environment-variables/) as they override `.env.test`.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/ElectronicBabylonianLiterature/ebl-frontend)

## Running tests

```sh
yarn lint
yarn tsc
yarn test
```

## Configuring services

### Auth0

A single page application has to be setup in Auth0. The frontends root URL (e.g. `http://localhost:3000` for development) must be in _Callback URLs_, _Logout URLs_, and _Web Origins_. _Domain_ and _Client ID_ are needed for the environment variables (see below). In a production environment the domain must be added to _frame-src_ in the CSP.

### Sentry

An organization and project need to be setup in Sentry. The applications domain must be in _Allowed Domains_ of the project. _DSN_ under _Client Keys_ is needed for the for the environment variables (see below). In a production environment the domain must be added to _frame-src_ in CSP.

### eBL API

In a production environment the api domain must be added to _img-src_ in CSP.

## Running the application

The application reads the configuration from following environment variables:

```dotenv
REACT_APP_AUTH0_DOMAIN=<Auth0 domain>
REACT_APP_AUTH0_CLIENT_ID=<Auth0 client ID>
REACT_APP_AUTH0_AUDIENCE=<Auth0 audience>
REACT_APP_DICTIONARY_API_URL=<eBL API URL>
REACT_APP_SENTRY_DSN=<Sentry DSN>
```

In production environments [INLINE_RUNTIME_CHUNK](https://create-react-app.dev/docs/advanced-configuration) must be set to `false` due to Content Security Policy.

`yarn start` starts the development server. The envoronment variables are read from `.env.local`.

## Lighthouse

Google [Lighthouse](https://developers.google.com/web/tools/lighthouse/) is installed as a development dependency and can be run via yarn:

```sh
yarn lighthouse <url>
```

## Promises

[bluebird](http://bluebirdjs.com) promises are used whenever a cancellable promise is needed. E.g. when loading data to components (see [isMounted is an Antipattern](https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html)). bluebird is compatible with native JavaScript promises, but care should taken that a bluebird promise is always used when `Promise.cancel()` is needed.

## Acknowledgements

[Junicode](http://junicode.sourceforge.net/) webfont by [psb1558](http://sourceforge.net/users/psb1558) is licensed under the [SIL Open Font License, Version 1.1](http://scripts.sil.org/OFL). You can get the full distribution from [Junicode download page](http://sourceforge.net/projects/junicode/?source=typ_redirect).

[Assurbanipal](https://www.hethport.uni-wuerzburg.de/cuneifont//) webfont by [Sylvie Vanséveren](https://www.hethport.uni-wuerzburg.de/cuneifont/) is freely available for the scientific community. You can get the full distribution from [Assurbanipal download page](https://www.hethport.uni-wuerzburg.de/cuneifont/).
