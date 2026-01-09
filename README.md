# Deprecated

This repo is deprecated, replaced by https://github.com/NYPL/research-catalog

<div align="center">

# NYPL Discovery Application

## The NYPL [Research Catalog](https://www.nypl.org/research/research-catalog/) (formerly Shared Collection Catalog)

For searching, discovering and placing a hold on research items from NYPL and ReCAP partners. Leverages data from our [Discovery API](https://github.com/NYPL-discovery/registry-api).

[![GitHub package.json version](https://img.shields.io/github/package-json/v/nypl/discovery-front-end?style=flat-square)](https://github.com/NYPL/discovery-front-end)

[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](https://nypl.org)

</div>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Project Configurations](#project-configurations)
  - [Node Runtime](#node-runtime)
    - [NVM](#nvm)
  - [Installation](#installation)
    - [Note: Pre and Post Installation](#note-pre-and-post-installation)
  - [Configurations](#configurations)
    - [Node](#node)
    - [Environment Variables](#environment-variables)
    - [VPN](#vpn)
    - [Authentication](#authentication)
    - [Local Hosting](#local-hosting)
  - [Development](#development)
    - [Different API environments](#different-api-environments)
    - [API Responses](#api-responses)
    - [Production mode](#production-mode)
- [Technology](#technology)
- [Tools](#tools)
  - [Prettier](#prettier)
- [Contributing](#contributing)
- [Webpack Bundle Analyzer](#webpack-bundle-analyzer)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [Code Coverage](#code-coverage)
  - [End-to-end Tests](#end-to-end-tests)
- [React Accessibility](#react-accessibility)
  - [eslint-plugin-jsx-a11y](#eslint-plugin-jsx-a11y)
  - [react-a11y](#react-a11y)
- [Deployment](#deployment)
- [Feedback Form](#feedback-form)
- [Alarm and Monitoring with AWS CloudWatch](#alarm-and-monitoring-with-aws-cloudwatch)
- [Adding Locations](#adding-locations)
- [Business Continuity](#business-continuity)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Project Configurations

### Node Runtime

Version 20. If using `nvm`, run `nvm use` to pick up the version configured in the `.nvmrc` file.

### Installation

To install packages, in the repo directory run the following command. Because of node version and npm package version issues, the `--force` flag is needed to override any conflicts.

```bash
$ npm install --force
```

or

```bash
$ npm i --force
```

#### Note: Pre and Post Installation

When installing you'll notice a pre and post install script run. These scripts are for **_QA_**/**_Production_**/**_Staging_** environments and can be ignored. However, if the scripts fail it may indicate you're running a different version of Node's runtime environment. Reference the project's current [Node Runtime](#node-runtime).

### Configurations

There are a few consideration to be aware of when spinning up a local development environment. While you will be able to view a local version on your machine with just setting up the environment variables, the application may soon break if the host isn't configured properly.

#### Node

Ensure you are running the proper [node version](#node-runtime). This app should run on node v20. If using `nvm`, run `nvm use` to use the app's node version set in the `.nvmrc` file.

#### Environment Variables

See `.env-sample` for supported environmental variables. Create a new `.env` file. Copy the contents of `.env-sample` to `.env` and replace placeholder values with your own - or obtain a prefilled version from a coworker.

See [ENVIRONMENTVARS](ENVIRONMENTVARS.md) for futher information on all environment variables used in this app.

#### VPN

Data is fetched via two APIs: Platform and `Subject Heading Explorer` (SHEP). For SHEP to perform correctly, OpenVPN Connect must be installed and connected. Contact DevOps if you need VPN access.

#### Authentication

Certain pages/content within the Discovery application require a user to be logged in. It's recommended to apply for a [NYPL library card](https://www.nypl.org/library-card) but it is not required.

There are additional test Patron and Staff Logins that can be used. Please ask a coworker for the list of available logins.

The login logic is managed by NYPL's Header component and authentication is handled via a cookie passed to a separate NYPL application and returned to our web server. However, authentication will fail if your local [hosting](#hosting) environment is not configured correctly.

#### Local Hosting

In order to successfully login under a local deployment you'll need to update your machine's `etc/hosts` file. This hosts file maps local host names to ips addresses.

Add this to your `etc/hosts` file. There is no need to remove or update any other configuration in this file. Simply add it at the end of the file.

```
	127.0.0.1       local.nypl.org
```

You can then view the site locally for testing on `http://local.nypl.org:3001/research/research-catalog/`

### Development

To run a local instance of the Discovery Front End application using configurations from `.env`, run:

```bash
$ npm run dev
```

Visit `localhost:3001/research/research-catalog/` to see the web app locally. If login authentication is needed, visit `local.nypl.org:3001/research/research-catalog/` (configured in the previous [Authentication](#authentication) section).

#### Different API environments

As a convenience, the following commands override some configurations for you:

- `npm run dev-api-start`: Use development API with *un*encrypted creds from `.env`
- `npm run prod-api-start`: Use production API with encrypted creds from `.env`

#### API Responses

There is a sample of the API responses that we receive from Platform in `sampleApiResponseStructure.json`. It is abbreviated but shows how we receive filters and search results. This is the response from the api endpoint, which the app sends requests to
whenever it requires new search results (for example when a new search is entered from the home page or when a subject link is followed from a Bib show page).

#### Production mode

By default, the app runs with `NODE_ENV=development`, which means a separate server is invoked to serve live updates to assets in development. Deployed instances of the app operate with `NODE_ENV=production`, indicating the app should serve pre-built assets. Sometimes it's useful to run the app in production mode locally (e.g. to test the app for NOSCRIPT visitors).

To run the app locally in production mode you need to run two commands:

- `npm run build`: This builds the assets.
- `source .env; npm run prod-start`: Start servers using production API & serve prebundled assets.

Visit `localhost:3001` to see the web app locally.

## Technology

- React
- Redux
- Webpack 4 & Webpack Dev Server
- ES6 and Babel
- ESLint with [Airbnb's config](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb)
- Unit Testing with [Mocha](https://mochajs.org/) and [Enzyme](http://airbnb.io/enzyme/)
- Express Server
- [Prettier](https://prettier.io/docs/en/index.html)

## Tools

### Prettier

[Prettier](https://prettier.io/docs/en/index.html) is a code formatting tool. The [.prettierrc](.prettierrc) configuration file defines the colaborative standards to use as our code format.

> Prettier
>
> It removes all original styling and ensures that all outputted code conforms to a consistent style.

Formatting is not automatic unless you've installed the [prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (assuming you're using [vscode](https://code.visualstudio.com/)) in your editor.

WIP: Unfortunately we do not have a hook set up to run the formatter prior to commiting. If you do not have prettier installed and running on a document save you'll have to run it manually.

```
npx prettier --write path/to/file
```

## Contributing

This app has an unusual Git Workflow / deployment scheme:

- Cut feature branches off of the `development` branch
- Post a PR targeting `development`
- Merge `development` into `qa` to deploy to QA
- Merge `qa` into `train` to deploy to the Training site
- Merge `qa` into `production` to deploy to production

There are a couple of scenarios that complicate the above workflow:

## Webpack Bundle Analyzer

We're using the [webpack-bundle-analyzer](https://github.com/th0r/webpack-bundle-analyzer) to analyze what is making the bundle file so big. When starting the app locally, or when running `npm run build`, a `report.html` file will be generated in `/dist`. View this file in the browser to see the results from `webpack-bundle-analyzer`.

## Testing

### Unit Tests

Unit tests are currently written in the [Mocha](https://mochajs.org/) testing framework. [Chai](http://chaijs.com/) is used as the assertion library and [Enzyme](http://airbnb.io/enzyme/) is used as the React testing utility.

The tests can be found in the `test` folder.

To run all the tests once, run

    $ npm run test

To run the tests continuously for active development, run

    $ npm run test-dev

To run a specific test file, run

    $ npm run test-file test/unit/SearchResultsPage.test.js

### Code Coverage

[Istanbul](https://istanbul.js.org/) is used for checking code coverage.

To run the code coverage tool and view a quick report, run

    $ npm run coverage

To run the code coverage tool and view a better report, run

    $ npm run coverage-report

This last command will create a folder called `coverage` in the root directory. You can open up `coverage/lcov-report/index.html` in a browser to see more details about what lines of codes have not been tested.

### End-to-end Tests

Currently testing out [Nightwatch.js](http://nightwatchjs.org/) as the testing framework. WebDriver and its API is used by Nightwatch to run end-to-end tests against a browser. WebDriver is a W3C specification aiming to standardize browser automation and that project started off as a part of the Selenium project.

In order to run the tests, the command will be:

    $ npm run nightwatch

but what first needs to be configured are the browser drivers and the Selenium Server.

- Create a folder `bin` at the root level.
- Download the [Selenium Server](http://selenium-release.storage.googleapis.com/index.html) picking the 3.x.x version. Add the `selenium-server-standalone-3.x.x.jar` file inside the `bin` folder.
- Download the latest [Chrome Driver](https://sites.google.com/a/chromium.org/chromedriver/downloads) and add it to the `bin` folder.
- Download the latest [Gecko Driver](https://github.com/mozilla/geckodriver/releases) (for FireFox) and add it to the `bin` folder.

Running `npm run nightwatch` should run the tests now which are located at `test/nightwatch/*`. Currently, starting the Selenium Server, selecting a browser, and running the tests are all encapsulated within the `npm run nightwatch` command.

The command

    $ npm run nightwatch

runs with Chrome as the default browser. If the Firefox browser wants to be tested, run

    $ npm run nightwatch -- --env firefox.

The `default`, `firefox`, and other nightwatch settings can be found in `./nightwatch.json`.

If you run into a Java version issue such as `java.lang.UnsupportedClassVersionError` when running the Selenium server, make sure that your current Java installation is being pointed to in `~/.bash_profile`:

    export JAVA_HOME="/Library/Java/.../Contents/Home/";

## React Accessibility

### eslint-plugin-jsx-a11y

Adding accessibility rule checker through ESLint and the [eslint-plugin-jsx-a11y](https://github.com/evcohen/eslint-plugin-jsx-a11y) plugin. This checks accessibility issues when ESLint is ran in the command line.

Note: At the moment, use ESLint as the global package by install the packages:

    $ sudo npm install -g eslint eslint-plugin-jsx-a11y eslint-config-airbnb

And to check files run:

    $ eslint src/app/components/.../path/to/file.jsx

Or all components at once:

    $ eslint src/app/components/**/*

### react-a11y

[react-a11y](https://github.com/reactjs/react-a11y) is an npm package that can be run in development mode when the `loadA11y` environment variable is set to true.

    $ loadA11y=true npm start

This will output warnings in the browser's console for elements that do not meet accessibility standards. Some rules may be too strict and should be verified against other accessibility rules.

## Deployment

We have CI/CD configured through Github Actions for the following branches:

- `qa` deploys `qa-new-discovery.nypl.org/`
- `train` deploys `new-discovery-training.nypl.org/`
- `production` deploys `new-discovery.nypl.org/`

### Production Ready Checklist

Before deploying DFE to Production, consider these questions:

- **Passed QA?**: Require verbal sign-off by relevant testers. This may be some combination of QA Engineers and Engineers. Should generally involve two people.
- **Are all dependencies deployed?**: Does the new feature depend on other services that should be updated first?
- **Are there config changes?**: If the feature depends on new config and the deploment action will not, on it's own, update deployed config, consider applying config update before deployment if possible.

After deploying DFE to Production, run this set of checks to verify the deployment:

 - Do a light regression test of basic functionality (e.g. Homepage, Search, Filter, View bib, Log in/out)
 - Test the specific feature introduced by the deployment
 - Manually invoke Chris's integration tests

## Feedback Form

The `Feedback` component in `src/app/components/Feedback/Feedback.jsx` can help us collect the feedback from patrons, send it to the Google Form, and finally, present it with [the Google Spreadsheet](https://docs.google.com/spreadsheets/d/1jD8EnC0uoPuo118jUF3of9MNgvrXTv1Jww67ZVJCSHs/edit#gid=536144761).

Every time the `Feedback` component has significant updates, it might lead to the need to create a new Google Form and Spreadsheet to match those updates. Here are the steps to create and sync the HTML form with a Google Form.

- First, create a Google Form based on the fields of the HTML form. The fields need to be the same type respectively.

- Second, under the `RESPONSES` tab, click the three dots icon to open the setting, then click `Select response destination`, choose `Create a new spreadsheet`. The spreadsheet will be the one to present the feedback.

- Then, go to the Google Form page and get the form URL.

- Forth, copy the URL, replace the path _/viewform_ with the path _/formResponse_ in its end. Enter the URL to the HTML form's action attribute.

- At last, view the page source of the Google Form page and find the value of each field's name attribute. Enter the value to the name attribute of the respectively field in the HTML form.

- Run the application and test it with the feedback form.

## Alarm and Monitoring with AWS CloudWatch

As one of the NYPL's services, we want to monitor its condition and receive necessary alarms if an error occurs. We set up the alarms and error filters on NYPL's [AWS CloudWatch](https://aws.amazon.com/cloudwatch/). For more details about setting up alarms and log metrics, please see NYPL engineering-general repo's [Monitoring & Alarms Instruction](https://github.com/NYPL/engineering-general/blob/master/standards/alerting.md).

## Adding Locations

This app relates Sierra location codes (e.g. `myv`, `mab`) to location details (hours, address) by:
 - Determines research location "slug" via `./src/app/utils/locations.js`
 - Looks up address and hours in `./locations.js`, a static copy of select Refinery data

You should not need change these files unless:

1. Research center hours/location/name change:
   - Update center properties in `./locations.js`
2. Sierra location id prefixes change (e.g. `my*` becomes `lp*`). This should be rare, but happened Jul 2023 when LPA `my*` Sierra locations where replaced with `lp*` and `pa*` locations.
   - You may need to update `./src/app/utils/locations.js` to ensure the new Sierra location code prefixes resolve to the proper slug.

## Business Continuity

There are variables available in the `.env` file to configure the requestable locations.

- `CLOSED_LOCATIONS` is a semicolon-delimited list of strings. Include quotes around the string. All locations beginning with any string in this list will be removed from the list of request options. `.env-sample` contains an example of this.

  Currently used physical locations: `Schwarzman;Science;Library for the Performing Arts;Schomburg`.

  To close all locations, add `all`. This will also remove EDD as a request option, the 'Request' buttons, and also disable the hold request/edd forms. If `all` is not present, EDD and 'Request' buttons will still be available.

- `OPEN_LOCATIONS` is a comma-delimited list of strings. If set to anything other than an empty string, only locations matching one of these strings will be displayed.

- `HOLD_REQUEST_NOTIFICATION`: This can be any string, including html, which will be added as a notification on the `HoldRequest` landing page and the EDD page.

- `SEARCH_RESULTS_NOTIFICATION`: Same as above, but will be added on the `SearchResults` page

Specifying `no-onsite-edd` as a feature will ensure that the discovery api returns all onsite items as eddRequestable: false.
Specifying `parallels` as a feature will enable interleaving of Bib fields with parallel fields.

## Run Application with Dockers Container

This application has been set up with Docker to ensure a controlled environment. To take advantage of this set up

1. Start your Docker Desktop.
2. Build docker container by running:

```sh
docker build --no-cache -t discovery-ui .
```

This command will build an image tagged (-t) as `discovery-ui` using the current directory. Any changes to the application will require a new tagged image to be created to view those changes. Either remove the existing image (copy the image ID to use in the `docker image rm` command) and run the same command above:

```sh
$ docker images

REPOSITORY          TAG       IMAGE ID       CREATED          SIZE
discovery-ui   latest    244d3d70e498   21 seconds ago   631MB

$ docker image rm 244d3d70e498
$ docker build -t discovery-ui  .
```

3. Start Docker using the newly created image:

```sh
docker run -d --name mycontainer -p 3001:3001 discovery-ui
```

4. Open app in browser at `http://localhost:3001`

Note: When introducing code changes you will have to rebuild the container:

1. Find the id of current container `docker container ls`
2. Remove current container `docker rm -f <container-id>`

To stop a Docker container, run:

```sh
$ docker stop mycontainer
```
