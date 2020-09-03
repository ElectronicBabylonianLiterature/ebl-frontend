# Electronic Babylonian Literature frontend

[![Build Status](https://travis-ci.com/ElectronicBabylonianLiterature/ebl-frontend.svg?branch=master)](https://travis-ci.com/ElectronicBabylonianLiterature/ebl-frontend)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0787509d99e64ee3cb93/test_coverage)](https://codeclimate.com/github/ElectronicBabylonianLiterature/ebl-frontend/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/0787509d99e64ee3cb93/maintainability)](https://codeclimate.com/github/ElectronicBabylonianLiterature/ebl-frontend/maintainability)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4)](https://prettier.io)
[![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade/www.ebabylon.org?publish)](https://observatory.mozilla.org/analyze/www.ebabylon.org)

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
in Gitpod](https://www.gitpod.io/docs/environment-variables/) as they seem to override `.env.test`.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/ElectronicBabylonianLiterature/ebl-frontend)

## Running tests

```sh
yarn eslint --ext .ts,.tsx src/
yarn tsc
yarn test
```

## Running the application

The application reads the configuration from following environment variables:

```dotenv
REACT_APP_AUTH0_DOMAIN=<Auth0 domain>
REACT_APP_AUTH0_REDIRECT_URI=<Auth0 redirect URI>
REACT_APP_AUTH0_CLIENT_ID=<Auth0 client ID>
REACT_APP_AUTH0_RETURN_TO=<Auth0 return to URL>
REACT_APP_DICTIONARY_API_URL=<eBL API URL>
REACT_APP_SENTRY_DSN=<Sentry DSN>
```

`yarn start` starts the development server. The envoronment variables are read from `.env.local`.

In production environments [INLINE_RUNTIME_CHUNK](https://create-react-app.dev/docs/advanced-configuration) must be set to `false` due to Content Security Policy.

```dotenv
INLINE_RUNTIME_CHUNK=false
```

## Lighthouse

Google [Lighthouse](https://developers.google.com/web/tools/lighthouse/) is installed as a development dependency and can be run via yarn:

```sh
yarn lighthouse <url>
```

## Promises

[bluebird](http://bluebirdjs.com) promises are used whenever a cancellable promise is needed. E.g. when loading data to components (see [isMounted is an Antipattern](https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html)). bluebird is compatible with native JavaScript promises, but care should taken that a bluebird promise is always used when `Promise.cancel()` is needed.

## Acknowledgements

[Junicode](http://junicode.sourceforge.net/) webfont by [psb1558](http://sourceforge.net/users/psb1558) is licensed under the [SIL Open Font License, Version 1.1](http://scripts.sil.org/OFL). You can get the full distribution from [Junicode download page](http://sourceforge.net/projects/junicode/?source=typ_redirect).
