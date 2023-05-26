# NodeJs + MongoDB

## Basic Setup and Tools

### Initialize the project

- create folder
- `pnpm init`
- add asdf .tool-versions file to set the node version

```
nodejs 18.16.0
```

### Setup basic folder structure

Create folders (as you like). The `server.ts` file will become the entry point for our application.

```
src
  |_ main
    |_server.ts
  |_ application
  |_ infrastructure
  |_ domain
test
```

### Typescript

- Install ts

```
pnpm add typescript
```

- Add good base line config. This github repo has a good set of base configurations for ts for different nodejs versions: https://github.com/tsconfig/bases

- Install the dependency for your node version (here 18)

```
pnpm add --save-dev @tsconfig/node18
```

- Create a ts config file `tsconfig.json` and one for the build `tsconfig-build.json` add the following

tsconfig.json

```json
{
  "extends": "@tsconfig/node18/tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDirs": ["src", "test"]
  },
  "include": ["src", "**/*.spec.ts"],
  "exclude": ["node_modules"]
}
```

tsconfig-build.json

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["**/*.spec.ts"]
}
```

- add types for node js

```
 pnpm add --save-dev @types/node
```

### Compile the code

To be able to run our application, we need to transform the `ts` files into `javascript`. We will use the `tsc` typescript compiler, which comes with `typescript` for that. Let's create a simple build script which deletes previously generated files and compiles a fresh version of our code.

To remove the old `dist` folder, we install a tool which enables us to remove files independent of the underlying OS.

```bash
pnpm add --save-dev rimraf
```

Now we can add the script to our `package.json`

```json
{
    ...
    "scripts": {
        "build": "rimraf dist && tsc -p tsconfig-build.json"
    }
    ...
}
```

Addionally to the build script we adjust the entry point of our package with the path from the dist folder.

```json
{
  "main": "dist/main/server.js",
  ...
}
```

#### Module aliases

We want to add some path aliases to have nicer imports. Therefore we need
to extend the tsconfig.json. We add path aliases for all our planned slices:

- main: The main entrypoint and configuration files
- infrastructure: Adapters for the db, third party apis and ohther tools which will potentially change in the future
- application: Our application rules and business logic goes here
- domain: Our domain entities with business rules
- test: Tests

```json
{
  "extends": "@tsconfig/node18/tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDirs": ["src", "test"],
    "baseUrl": "./src" /* Specify the base directory to resolve non-relative module names. */,
    "paths": {
      "@domain/*": ["domain/*"],
      "@application/*": ["application/*"],
      "@infrastructure/*": ["infrastructure/*"],
      "@main/*": ["main/*"],
      "@test/*": ["../test/*"]
    }
  },
  "include": ["src", "**/*.spec.ts"],
  "exclude": ["node_modules"]
}
```

To make this work we need to install the module-alias package.

```bash
pnpm add --save module-alias
```

Now we need to extend the package json with some alias configuration.
We add the mappings between the alias and the associated compiled code.

```json
{
    ...
    "_moduleAliases": {
        "@domain": "dist/domain",
        "@application": "dist/application",
        "@infrastructure": "dist/infrastructure",
        "@main": "dist/main"
    },
    ...
}
```

To test the setup, we add our folder structure to src and create a file
`test.ts` in the application folder with a simple log statement.

```ts
export function hello(): void {
  const name: string = "World";
  console.log(`Hello ${name}`);
}
```

We import the created funtion into our server.ts inside src/main and register the module-alias package.

```ts
import "module-alias/register";

import { hello } from "@application/test";

hello();
```

Now wie can run

```bash
npm run build
node dist/main/server.js
```

If everything works correctly you should see `Hello World` on your console.

### Set up git

In your project root run following command.

```bash
git init
```

Add a `.gitignore` in your projects root directory. I use this one as a starting point and remove the things I don't need.

https://github.com/github/gitignore/blob/main/Node.gitignore

### Eslint

I simply use the init script of eslint with the following choices:

```bash
npm init @eslint/config
```

- only check syntax and find problems, we use prettier for formatting
- JS Modules
- No UI Framework
- TS yes
- Run in Node
- Format: JSON
- Yes install dependencies
- pnpm

I'm really fine with the default settings I get from this script, because I try to stick a close to the defaults as possible. If I really need
some modification I just change it along the way.

```json
{
  "env": {
    "es2021": true,
    "node": true
  },
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "overrides": [],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {}
}
```

Add a script to `package.json` to run linting for staged files and during the ci pipeline.

```json
{
    "scripts": {
        ...
        "lint:staged": "eslint --ignore-path .gitignore --ext .ts --fix",
        "lint:ci": "eslint --ignore-path .gitignore --ext .ts"
        ...
    }
}
```

### Prettier Formatter

Install prettier

```bash
 pnpm add --save-dev prettier
```

Add the `prettierrc` config file to your root directory.
I just use the default for `prettier`. To enforce that for the project
I add an empty configuration to the file.

```json
{}
```

To avoid formatting unnecessary files we add a `.prettierignore` file to the root directory with the following contents:

```bash
build
coverage
```

We also add a script to `package.json` to run formatting for staged files and during the ci pipeline.

```json
{
    "scripts": {
        ...
        "format:ci": "npx prettier --check .",
        "format:staged": "npx prettier --write .",
        ...
    }
}
```

### Jest and Supertest

Ok, let's continue with the setup for our tests. We want to use `jest`
with typescript and mongodb to test our code. To write tests for our
upcoming `express` api we also want to use `supertest`. Let's install
the necessary dependencies:

```bash
pnpm add --save-dev jest ts-jest @types/jest @shelf/jest-mongodb supertest @types/supertest
```

To generate a inital jest config run

```bash
 ./node_modules/jest/bin/jest.js --init
```

- use for test script - yes
- ts for config file - no
- environment - node
- coverage - no - we will set this in the config
- provider - v8
- clear mock calls - no

Adjust your newly generated `jest.config.js` file.

Adjust coverage settings:

```js
{
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
        "!<rootDir>/src/main/**/*.ts"
    ],

    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",
}
```

In the same file add this moduleNameMapper settings:

```js
{
    moduleNameMapper: {
        "@domain/(.*)": "<rootDir>/src/domain/$1",
        "@application/(.*)": "<rootDir>/src/application/$1",
        "@infrastructure/(.*)": "<rootDir>/src/infrastructure/$1",
        "@main/(.*)": "<rootDir>/src/main/$1",
        "@test/(.*)": "<rootDir>/src/test/$1"
    },
}
```

In the same file change the root for the test files:

```js
{
    roots: ["<rootDir>/test/"],
}
```

In the same file change the preset to be able to use mongodb. We also ignore
`globalConfig` to avoid some gotchas with jests watch mode.

```js
{
    preset: "@shelf/jest-mongodb",

    ...

    watchPathIgnorePatterns: ['globalConfig']
}
```

To be able to use jest-mongodb we also need to add a configuration file to our root directory: `jest-mongodb-config.js`.

**It's important that the specified version for the binary matches with your mongo db version!**

```js
module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: "4.0.3",
      skipMD5: true,
    },
    autoStart: false,
    instance: {},
  },
};
```

Setup `ts-jest` in your `jest.config.js`. For that we need to import
the `ts-jest` library with

```js
const { defaults: tsjPreset } = require("ts-jest/presets");
```

at the top of `jest.config.js`. After that we add a transform option for `ts-jest` to the configuration.

```js
{
    ...
    transform: {
        ...tsjPreset.transform,
    }
    ..-
}
```

#### Add test scripts

Add test scripts in `package.json`

```json
{
  "test": "jest --passWithNoTests",
  "test:watch": "npm run test -- --watch",
  "test:staged": "npm run test -- --findRelatedTests",
  "test:ci": "npm run test -- --coverage"
}
```

--runInBand: tests will not be executed in parallel -> could be necessary for mongo db testing

-- no-cache: if you experience any caching propblems you could use this option

We add to addional tests for staged files (we want run tests for staged files before commiting - see husky section down below) and CI where we want to generate a coverage report.

To check if jest is working we add a simple example test to the test directory and run it with `npm run test:watch`.

```js
describe("example", () => {
  test("check if jest is working", () => {
    const leftInput = "4";
    const rightInput = "2";
    expect(leftInput + rightInput).toEqual("42");
  });
});
```

### Husky

Now we also want to install `husky` to improve our commits before they go
into git. What we want to do:

- check commit message format -> We use conventional commits
- run linting
- run formatting
- run tests

Install husky with

```bash
pnpm dlx husky-init && pnpm install
```

This will initialize `husky` and add a simple pre-commit hook which runs tests with `npm test`

To be able to run linting and formatting on staged files we also install
`lint-staged`

```bash
pnpm add --save-dev lint-staged
```

Now we change our `pre-commit` inside the `.husky` directory to the following to run lint-stage.

```bash
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

To tell `lint-stage` which commands shall be executed on our staged files
we need to add a litte bit of configuration to our `package.json`

```json
{
    ...
    "lint-staged": {
        "*.ts": [
            "npm run format:staged",
            "npm run lint:staged",
            "npm run test:staged"
        ]
    }
    ...
}
```

We also want `husky` to check our commit messages. Therefore we install `commitlint`

```bash
pnpm add --save-dev @commitlint/{cli,config-conventional}
```

After that we add a new husky hook.

```bash
npx husky add .husky/commit-msg  'npx --no -- commitlint --edit ${1}'
```

Finally we need to run the following script to create a configuration file.

```bash
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

## Express

Installation

- express: webframework
- morgan: logging middleware

```bash
pnpm add express morgan
```

Add types

```bash
pnpm add --save-dev @types/express @types/morgan
```

### Add a minimal server

At first we add a `app.ts` in the main folder.

[app.ts]

```js
import express from "express";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));

app.get("/health", (req, res, next) => {
  res.json({ message: "OK" });
});

export default app;
```

We then import the created app into `server.ts` and listen to it. Before that we create a `main/config/env.ts` to hold our environment variables.

[env.ts]

```js
const port = Number(process.env.PORT ?? 8000);
const host = process.env.HOST ?? "0.0.0.0";

export { port, host };
```

We can now use the port and host in the server.ts to listen to incoming requests.

[server.ts]

```js
import "module-alias/register";
import app from "@main/app";
import { host, port } from "./config/env";

app.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`);
});
```

This should be enought to test our express server with

```bash
npm run build
node dist/main/server.js
```

## Create a dockerfile for the app

Create a `dockerfile` inside the root directory.

```dockerfile
FROM node:18-alpine

RUN npm install -g pnpm

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 8000
CMD ["pnpm", "start"]
```

Beacause we don't want to compy anything into the docker file we also need
a `.dockerignore` file.

```bash
.pnpm-store
.vscode
dist
node_modules
```

The dockerfile is good for building our docker image. But to run
our app together with a database and maybe some other services we
need a `docker-compose.yaml` file, too. We also want to reload our
express server inside of docker if any typescript files changes. To
achieve this we need to install `nodemon`.

```bash
pnpm add -D nodemon
```

We add a litte bit of configuration to a newly created `nodemon.json` configuration
file in our root directory.

```json
{
  "verbose": true,
  "watch": ["src/**/*.ts"],
  "execMap": {
    "ts": "pnpm build && pnpm start:dev"
  }
}
```

To run our app with `nodemon` we add a script to `package.json`

```json
{
  "scripts": {
    "start:watch": "nodemon ./src/main/server.ts"
  }
}
```

Now we can create our `docker-compose.yaml`. This is not a docker-compose configuration for production.
We only use it to run our app with it's necessary dependecies like mongodb in development.

```yaml
version: "3"

services:
  mongodb:
    container_name: app-mongodb
    image: mongo:6.0.5
    restart: always
    volumes:
      - ./data/db:/data/db
    ports:
      - 27017:27017
  backend:
    container_name: app-backend
    build: .
    ports:
      - 4000:4000
      - 9229:9229 # for debugging
    environment:
      - PORT=4000
      - MONGO_URL=mongodb://mongodb:27017/collection
    volumes:
      - .:/usr/src/app
      - /usr/src/app/pnpm-store
      - /usr/src/app/node_modules
    command: "pnpm start:watch"
    depends_on:
      - mongodb
```

Here we add two services a mongodb with some basic configuration and our own app.
To build our app with docker-compose we use our dockerfile. We overwrite the
port of our application and the start command. For the start command we use our
npm script with nodemon. Since we mount the whole project directory to the /app
directory inside docker, nodemon is able to detect file changes, rebuild the app and
restart the server.

## Debugging (VS Code)

Script

```json
scripts: {
    "start:dev": "node --inspect=0.0.0.0:9229 dist/main/server.js",
}
```

Extend `tsconfig.json` and add:

```json
compilerOptions: {
    "sourceMap": true,
}
```

Add a `launch.json` to your `.vscode` directory. Create it if it does not exist.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Node (Docker)",
      "port": 9229,
      "restart": true,
      "remoteRoot": "/usr/src/app",
      "sourceMaps": true,
      "skipFiles": ["/usr/src/app/node_modules/**/*.js", "<node_internals>/**"]
    }
  ]
}
```
