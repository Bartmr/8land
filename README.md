# 8Land

8Land is an open pixel-art RPG game where players design their own lands and launch their own public games. The objective is to have the gameplay of [Decentraland](https://decentraland.org/) and the feel and nostalgia of Pokemon Gold and Silver

![alt text](screenshot.png 'Screenshot')

## Copyright Notice

This Github repository does not include any license and is therefore subject to default copyright laws. The code contained within this repository is copyrighted and the user is not allowed to distribute, modify, or share the code without the permission of the copyright holder.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Code quality

**Let me remind you that this codebase is old**.

It favours owning and customizing abstractions even for the build pipeline, so I could share Typescript code and guarantee type-safety between backend and frontend back then. It's also very bloated and made during my free hours, with the objective of just having an MVP.

**This is no longer the methodology I follow** , since it takes a lot of time, and brings a lot of non-product related code into your workload. With the advance of Large Language Models, I also try to stick with the defaults of frameworks and use 3rd party providers the most, since it makes it easier to use these models to generate new code.

## Development

### Setup

> This repository provides a `devcontainer` in case you want to run the project in a container isolated from your host setup

- `npm run install:all`
- Setup and start the Firebase Emulator Suite
  - Create a new project in the [Firebase Console](console.firebase.google.com/)
  - Install the Firebase CLI: `npm install -g firebase-tools`
  - Login with your Google Account: `firebase login`
  - Setup the emulators: `firebase init emulators`
    - You will only need the `Authentication Emulator`
    - Leave everything else in its default values
- Setup the project's secrets
  - Create an API secrets file called `.env.secrets.development` in the root of the project and fill it with the necessary secrets
    - required environment variables are listed in `src/internals/environment/environment-variables.schema.ts`
  - Create a Web App secrets file called `.env.secrets.development` in `client-side/web-app` and fill it with the necessary secrets
    - required environment variables are listed in `client-side/web-app/src/logic/app-internals/runtime/environment-variables.ts`
- Start Firebase
  - `npm run start:dev:firebase`
- Start your project's infrastructure (example: databases, Redis, etc.)
  - `./start-dev-infrastructure.sh`
- Seed the development database with sample data by running `NODE_ENV=development npm run seed`

#### ~~Crypto setup (no longer used)~~

- Set up an Alchemy account at <https://www.alchemy.com/>
- Create a Metamask Wallet
- Build the smart-contracts by running `NODE_ENV=development npm run build:smart-contracts`
- Deploy smart-contracts into a testnet
  - run `NODE_ENV=development npm run ts-node ./dist/scripts/deploy.ts`
  - take note of the contracts addresses and place them in `.env.secrets.development` to be used environment variables

### Start

- Start Firebase
  - `npm run start:dev:firebase`
- Start your project's infrastructure (example: databases, Redis, etc.)
  - `./start-dev-infrastructure.sh`
- Start the server with `npm run start:dev`, or `npm run start:debug` if you want to debug the API in the Chrome Developer Tools
- To run the web app:
  - `cd client-side/web-app`
  - `npm run develop`
- Open `http://localhost:8000` and start developing

### Logins

- `end-user@8land.com`
  - `password123`
- `admin@8land.com`
  - `password123`

### Useful Commands

> Before running any of these commands, you need to set an environment first by prefixing the command with `NODE_ENV=<development | test>`.

This is in order to avoid running some of these commands in a production environment, even if it has no `NODE_ENV` set.

#### Database operations:

- **Seed data**: `npm run seed`
- **Tear down databases**: `npm run tear-down-databases`

#### TypeORM:

_Typeorm_ entities should always be placed in directories named `typeorm` and have their file name ending in `.entity.ts` in order to be detected by the _Typeorm CLI_.

**Newly created migrations should be imported and placed in `all-migrations.ts` files in order to run.**

- **Generate migration**: `npm run typeorm migration:generate -- -- --pretty -n MigrationName`
- **Create empty migration**: `npm run typeorm migration:create -- -- -n MigrationName`
- **Run migrations**: `npm run typeorm migration:run`
- **Revert last migration**: `npm run typeorm migration:revert`
- **Any other TypeORM command**: `npm run typeorm {command} -- -- --{argument}`

#### Smart contracts

- Deploy
  - Development
    - Build the smart contracts
    - `NODE_ENV=development npm run ts-node ./scripts/deploy.ts`
    - Take note of the deployed contracts addresses
    - Set those addresses as environment variables in `.env.secrets.development`
  - Production
    - Set the necessary environment variables in your terminal
    - Build the smart contracts: `npm run build:smart-contracts`
    - Build the api: `npm run build:api`
    - `NODE_ENV=production node ./dist/scripts/deploy.js`
    - Take note of the deployed contracts addresses
      - Set those addresses as environment variables in your production server
      - Do not replace environment variables, but instead, try to version them, in order to avoid downtime or errors
        - Example: `SOMETHING_CONTRACT_ADDRESS` and `SOMETHING_CONTRACT_ADDRESS_V2`

### Automatically document endpoints for Swagger:

- Place your _DTO_ classes inside files ending in `.dto.ts`. NestJS compiler plugins will take it from here.

### Creating background jobs:

In order for a background job to run in a separate process and be compiled in a separate file from the server code, just have its file name end in `.job.ts`. The job function should also be wrapped around `app__runJob()` which is a global variable made available by importing `src/internals/jobs/run-job`. **Make sure you import this file on top of other imports. It's a module with side-effects** that does the usual setup like loading environment variables, logging and error handling.

### Sharing your development environment with others:

- Shut down all your services
- Set up [Ngrok](https://ngrok.com/)
- Set up your services in `~/.ngrok2/ngrok.yml` by adding:

```yml
tunnels:
  service_1:
    addr: 3000
    proto: http
    bind-tls: true # Forces HTTPS only tunneling
  service_2:
    addr: 8000
    proto: http
    bind-tls: true # Forces HTTPS only tunneling
```

- Run `<place where ngrok is installed>/ngrok start --all`
- Remember to update the URLs in your services configuration files in order to match the URLs exposed by Ngrok
- Start your services
- Share the Ngrok URLs with whoever asked to try your app

### When developing

- Read about **validations** here: <https://github.com/Bartmr/not-me>
- **Avoid configurations that are tied to the build type** (example: values and configurations that use `NODE_ENV`).
- **Do not access environment variables directly** (the linter will problably stop you from doing that). Use the `EnvironmentVariablesService` to access these variables. This service is responsible for parsing and validating all environment variables that are used.
- **Always use custom repositories** In order to **enforce the use of the custom logic implemented in each repository** _(like auditing rows changes when extending `AuditedEntityRepository`)_ and to make sure that **entities have all their required fields filled**, always use custom repositories, by calling `(connection or manager).getCustomRepository(CustomRepositoryClass)`.
  - **As a rule of thumb**, if you're using the entity class as a value, or using it's constructor, you're problably doing it wrong and you should use or augment your entity's custom repository.
- **DTOs should NOT have methods.** There is currently a problem with reflection and class instances: imagine you want to self-document an endpoint by using Swagger: you annotate a _DTO_ class properties with Swagger decorators, and then set the body argument type in the controller method with said _DTO_ class. The real type that is going to come from that argument is not going to be an instance of the _DTO_ class but an Object instance / object literal with the same properties (but not the methods) as the DTO class. This is because we use a validation mechanism that only runs on runtime and outputs object literals with the validated values. Setting something like `class-transformer` would bring new problems regarding the _type safety_ between the class properties and the decorators annotating them. So this seems to be the more flexible choice. This body argument is then going to circulate deeper in other parts of the app, like services and other functions. **That is why you should avoid using `instanceof` on values that problably came from outside the API**, as it will always return false: because the value is not really an instance of the _DTO_ class, but an instance of Object. That also means that the body argument, altought typed as the _DTO_ class, will not have its methods. Typescript will allow you to call a method as if it were a real _DTO_, but it will throw an exception since that method doesn't really exist. **That's why you should not declare methods on _DTO_ classes**.

  ```typescript
  class SomeDTO {
    public value: string;

    doSomething() {

    }
  }

  @Controller('some-path')
  export class SomeController {
    @Post()
    async create(
      @Body() someDTO: SomeDTO /* <-- Is not a real instance of SomeDTO,
        but is an object literal with the same properties and none of the methods */
    ): Promise<SomeDTO> {
        console.log(someDTO.value) // <-- will print a value

        console.log(someDTO instanceof SomeDTO) /* <-- Will always return false, since someDTO is an instance of an object literal.
        DO NOT USE instanceof TO DISTINGUISH VALUE TYPES */

        someDTO.doSomething() // <-- Will crash, since the object literal has the properties of SomeDTO, but not the methods

        return 'will-never-get-here';
  }
  ```

## Related projects

- Not-Me: <https://github.com/Bartmr/not-me>

### Upgrading Node

- Files to be changed
  - .nvmrc
  - BREAKING-CHANGES.md
    - add warning for inherited projects to delete all `node_modules` directories and `package-lock.json` files, and then run `npm run install:all`
  - Dockerfile
  - Dockerfile.dev
  - client-side/web-app/.nvmrc
  - client-side/web-app/Dockerfile
  - client-side/web-app/load-build-environment.js
  - client-side/web-app/package.json
    - `engine` field
    - `@types/node` version
  - package.json
    - `engine` field
    - `@types/node` version
  - tsconfig.base.json
- delete all `node_modules` directories and `package-lock.json` files
- run `npm run install:all`

### Adding a library under `libs` or any `.ts` files outside of `src` or `libs/shared`

- Files to be changed
  - .gitignore
    - could instead just add a `.gitignore` file inside the new library
  - .prettierignore
  - .dockerignore
  - Dockerfile
  - .eslintignore
  - .eslintrc.js
  - All `tsconfig` files
  - package.json
    - add the necessary steps to cover the new library code in the integrity checks
  - Web App (and other nested projects)
    - .dockerignore
    - Dockerfile
    - .eslintignore
    - .eslintrc.js
    - All `tsconfig` files
      - also add an alias/path for the new library, so it doesn't get directly imported with a relative path
    - package.json
      - copy the new library source files to the `dist` directory when running the release build
    - Webpack resolvers and aliases
      - add a new alias for the new library, pointing to `libs` during local builds and to `dist` during release builds
