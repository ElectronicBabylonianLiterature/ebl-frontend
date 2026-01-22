# electronic Babylonian Library frontend

[![CI](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/actions/workflows/main.yml/badge.svg)](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/actions/workflows/main.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0787509d99e64ee3cb93/test_coverage)](https://codeclimate.com/github/ElectronicBabylonianLiterature/ebl-frontend/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/0787509d99e64ee3cb93/maintainability)](https://codeclimate.com/github/ElectronicBabylonianLiterature/ebl-frontend/maintainability)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4)](https://prettier.io)
[![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade/www.ebl.lmu.de?publish)](https://observatory.mozilla.org/analyze/www.ebl.lmu.de)

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). You can find the most recent version of the guide [here](https://github.com/facebook/create-react-app/blob/main/packages/cra-template/template/README.md).

## Requirements

- yarn
- Node 16
- Chrome (for Lighthouse)

The following services are needed to run application:

- [eBL API](https://github.com/ElectronicBabylonianLiterature/ebl-api)
- [Auth0](https://auth0.com)
- [Sentry](https://sentry.io)

## Development Environment Setup

This project supports two development setup options: **GitHub Codespaces with dev containers** (recommended) or **local installation**.

### Option 1: GitHub Codespaces with Dev Containers (Recommended)

This project is configured to work with [GitHub Codespaces](https://github.com/features/codespaces) using dev containers. The dev container provides a pre-configured development environment with all necessary dependencies (Node 16, yarn, Chrome, etc.) without requiring local installation.

**To use GitHub Codespaces:**

1. Navigate to the repository on GitHub
2. Click the **Code** button and select the **Codespaces** tab
3. Create a new codespace or open an existing one
4. **Important:** For dev containers to work properly, open the codespace in the **desktop version of VS Code** rather than the browser. When the codespace starts, VS Code will prompt you to open it in the desktop application.
5. Once opened in VS Code desktop, the dev container will automatically set up the development environment
6. Configure the required environment variables in `.env.local` (see [Running the application](#running-the-application) section)
7. Dependencies are installed automatically via the `postCreateCommand` in the dev container configuration (you can manually run `yarn install` if needed)
8. You're ready to develop!

### Option 2: Local Installation

If you prefer to develop locally without using Codespaces, follow these steps:

**Prerequisites:**

- Install [Node 16](https://nodejs.org/)
- Install [yarn](https://yarnpkg.com/getting-started/install)
- Install [Git LFS](https://git-lfs.github.com/) (required for the Git hooks)
- Install Chrome (required for Lighthouse)

**Setup:**

1. Clone the repository:

   ```sh
   git clone https://github.com/ElectronicBabylonianLiterature/ebl-frontend.git
   cd ebl-frontend
   ```

2. Install dependencies:

   ```sh
   yarn install
   ```

   This will automatically patch [history](https://github.com/remix-run/history) in node_modules which is an indirect dependency for [react-router](https://github.com/remix-run/react-router) version 5 because of [https://github.com/remix-run/history/issues/505](https://github.com/remix-run/history/issues/505) (updating react-router to version 6 would fix this issue too).

3. Configure environment variables in `.env.local` (see [Running the application](#running-the-application) section)

4. Start the development server:
   ```sh
   yarn start
   ```

## Running tests

```sh
yarn lint
yarn tsc
yarn test
```

### Running test coverage check

`yarn test --coverage --watchAll`

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
REACT_APP_CORRECTIONS_EMAIL=<Email for submitting corrections>
REACT_APP_INFO_EMAIL=<Email for general questions and contact>
REACT_APP_GA_TRACKING_ID=<Google Analytics 4 tracking (measurement) Id>
```

In production environments [INLINE_RUNTIME_CHUNK](https://create-react-app.dev/docs/advanced-configuration) must be set to `false` due to Content Security Policy.

`yarn start` starts the development server. The environment variables are read from `.env.local`.

## Updating dependencies

Updating [react-image-annotation](https://github.com/Secretmapper/react-image-annotation) could break `Annotation.js`
in the annotation-tool.

## Lighthouse

Google [Lighthouse](https://developers.google.com/web/tools/lighthouse/) is installed as a development dependency and can be run via yarn:

```sh
yarn lighthouse <url>
```

## Promises

[bluebird](http://bluebirdjs.com) promises are used whenever a cancellable promise is needed. E.g. when loading data to components (see [isMounted is an Antipattern](https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html)). bluebird is compatible with native JavaScript promises, but care should taken that a bluebird promise is always used when `Promise.cancel()` is needed.

## Authentication and Authorization

Authentication is handled with [Auth0](https://auth0.com) and [@auth0/auth0-spa-js](https://github.com/auth0/auth0-spa-js).

Display of content can be controlled using `SessionContext`:

```tsx
// Access with Context.Consumer
;<SessionContext.Consumer>
  {(session: Session): JSX.Element => (
    <span>{session.isAllowedToReadFragments() ? 'access' : 'no access'}</span>
  )}
</SessionContext.Consumer>

// Access with useContext hook
const session = useContext(SessionContext)
const hasAccess = session.isAllowedToReadTexts()
```

### Sitemap

The sitemap provides a roadmap of the website's content to help search engines index all pages and improve the site's visibility in search results.

#### ✅ Automated Update (Recommended)

The sitemap is now updated automatically using a GitHub Actions workflow. This routine runs once a week and also allows manual execution when needed.

**To manually trigger the automated sitemap update:**

1. Go to the repository's **"Actions"** tab on GitHub.
2. Select the workflow named **"Update Sitemap"**.
3. Click **"Run workflow"** (top right) and confirm.

This action will:

- Download and regenerate the sitemap files.
- Create a pull request with the updated files.
- Automatically merge the pull request once all required checks pass.

⚠️ Note that an application redeploy ([Swarmpit](https://www.ebl.lmu.de/cluster/swarmpit/#/stacks/ebl)) is still needed for the sitemap to refresh.

#### 🔑 Personal Access Token (PAT) Setup (Yearly Maintenance)

To keep the automation working, you must refresh the `SITEMAP_AUTOUPDATE` secret approximately **once per year**, as PATs expire.

1. Go to your GitHub [Developer Settings → Fine-Grained Tokens](https://github.com/settings/personal-access-tokens).
2. Create a Fine-Grained Token:
   - Restrict it to just the ElectronicBabylonianLiterature/ebl-frontend repo.
   - Minimal scopes. Contents: Read and write, Pull requests: Read and write.
3. Name the token `sitemap-autoupdate` and set an expiration period (max. 12 months).
4. Save the value of the new token.
5. In the repository, go to **Settings → Secrets and variables → Actions → Repository secrets**.
6. Find `SITEMAP_AUTOUPDATE` and update the value with the token you just generated.
7. Save the secret. The next time the workflow runs, it will use the updated token.
8. If the PAT user changes, update `git config user.name` and `git config user.email` information in `.github/workflows/update-sitemaps.yml`.

#### 🛠 Manual Update (Legacy Method)

Manual update is possible if automation fails.

1. Visit the sitemap page: [https://www.ebl.lmu.de/sitemap](https://www.ebl.lmu.de/sitemap)
2. Wait until all files (`sitemap.xml.gz`, `sitemap1.xml.gz`, etc.) are downloaded.
3. Replace the content of the `public/sitemap` directory with the downloaded files.
4. Commit the changes to the `master` branch.

## Coding Conventions

- Write [clean code](https://www.amazon.de/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882).
  Use linters and analysers to find code smells.
- Write tests for your code. Test Driven Development is recommended but not mandatory.
  There is no hard requirement for code coverage but it should improve over time.
- Use [GitHub Flow](https://guides.github.com/introduction/flow/) for branches..
- Implement a proper domain model. Avoid passing data around in dictionaries.
- Prefer immutable value objects.
  Use [Immer](https://immerjs.github.io/immer/) to update objects.
- Use [Prettier](https://prettier.io) code style.
- Always use TypeScript files .ts, .tsx.
- Stick to the [good parts](https://smile.amazon.de/JavaScript-Parts-Working-Shallow-Grain/dp/0596517742).
- Avoid [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library).
- Wrap relevant tests in `act()`: Testing causes many warnings due to user actions not being wrapped in act. Since the tests are starting to get unwieldy, these errors should be fixed.

### HTML/CSS

- Try to use semantic HTML.
- Use [BEM](http://getbem.com/) naming convention for CSS classes.
- Use lowercase names for CSS classes.

### Filenames

- TypeScript files with default import should have the same name as the default import.
  E.g. `MyComponent.tsx`, `myFunction.tsx`.
- CSS/Sass files for components should have the same name as
  the TSX File they are used in. E.g. `MyComponent.css`
- Other files and folders should have kebab case names.
  E.g. `test-helpers.ts`

## Acknowledgements

[Junicode](https://github.com/psb1558/Junicode-font) webfont by [psb1558](https://github.com/psb1558) is licensed under the [SIL Open Font License, Version 1.1](http://scripts.sil.org/OFL). You can get the full distribution from [Junicode download page](https://github.com/psb1558/Junicode-font).

[Assurbanipal, Esagil, Santakku, SantakkuM, UllikummiA](https://www.hethport.uni-wuerzburg.de/cuneifont//) webfonts by
[Sylvie Vanséveren](https://www.hethport.uni-wuerzburg.de/cuneifont/) are freely available for the scientific community.
You can get the full distributions from [Download page](https://www.hethport.uni-wuerzburg.de/cuneifont/).

`Annotation.js` in the annotation-tool is from [Arian Allenson Valdez](https://github.com/Secretmapper/react-image-annotation)
