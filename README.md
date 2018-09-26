# Electronic Babylonian Literature frontend

[![Codeship Status for ElectronicBabylonianLiterature/ebl-frontend](https://app.codeship.com/projects/81f1a480-4637-0136-73e8-46e54b124c02/status?branch=master)](https://app.codeship.com/projects/292066)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0787509d99e64ee3cb93/test_coverage)](https://codeclimate.com/github/ElectronicBabylonianLiterature/ebl-frontend/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/0787509d99e64ee3cb93/maintainability)](https://codeclimate.com/github/ElectronicBabylonianLiterature/ebl-frontend/maintainability)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). You can find the most recent version of the guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Requirements

- yarn
- Node

## Promises

[bluebird](bluebirdjs.com) promises are used whenever a cancellabe promise is needed. E.g. when loading data to components (see [isMounted is an Antipattern](https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html)). bluebird is compatible with native JavaScript promises, but care should taken that a bluebird promise is always used when `Promise.cancel()` is needed.

## Acknowledgements

[Junicode](http://junicode.sourceforge.net/) webfont is licensed under the [SIL Open Font License, Version 1.1](http://scripts.sil.org/OFL). You can get the full distribution from [Junicode download page](http://sourceforge.net/projects/junicode/?source=typ_redirect).


