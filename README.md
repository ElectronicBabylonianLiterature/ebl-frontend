# Electronic Babylonian Literature frontend

[![Codeship Status for ElectronicBabylonianLiterature/ebl-frontend](https://app.codeship.com/projects/81f1a480-4637-0136-73e8-46e54b124c02/status?branch=master)](https://app.codeship.com/projects/292066)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0787509d99e64ee3cb93/test_coverage)](https://codeclimate.com/github/ElectronicBabylonianLiterature/ebl-frontend/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/0787509d99e64ee3cb93/maintainability)](https://codeclimate.com/github/ElectronicBabylonianLiterature/ebl-frontend/maintainability)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4)](https://prettier.io)
[![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade/www.ebabylon.org?publish)](https://observatory.mozilla.org/analyze/www.ebabylon.org)

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). You can find the most recent version of the guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Requirements

- yarn
- Node
- Chrome (for Lighthouse)

## Running tests

```
yarn eslint --ext .ts .tsx src/
yarn tsc
yarn test
```

## Lighthouse

Google [Lighthouse](https://developers.google.com/web/tools/lighthouse/) is installed as a development dependency and can be run via yarn:
```
yarn lighthouse <url>
```

## Promises

[bluebird](http://bluebirdjs.com) promises are used whenever a cancellable promise is needed. E.g. when loading data to components (see [isMounted is an Antipattern](https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html)). bluebird is compatible with native JavaScript promises, but care should taken that a bluebird promise is always used when `Promise.cancel()` is needed.

## Acknowledgements

[Junicode](http://junicode.sourceforge.net/) webfont by [psb1558](http://sourceforge.net/users/psb1558) is licensed under the [SIL Open Font License, Version 1.1](http://scripts.sil.org/OFL). You can get the full distribution from [Junicode download page](http://sourceforge.net/projects/junicode/?source=typ_redirect).


