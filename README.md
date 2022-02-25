## Quick stuff

## Updating the project's boilerplate

To update the project's boilerplate, just run `update-project-boilerplate.sh` and input the _Git_ repository URL of the boilerplate your project is based on. In this case `https://github.com/Bartmr/estirador.git`

## Adding layers

The core version of `estirador` can be enhanced with some pre-made layers that change its functionality and architecture (example: have `estirador` use `NextJS` instead of `Gatsby` ). These layers are placed on top of the default distribution's updates. To add a layer, you only have to run the update script like its described above, and instead of fetching updates from the `main` branch, you pick one of the layer branches listed here:

- `layer-auth` - Adds authentication and authorization to your project
- `layer-nextjs` - Replaces `Gatsby` with `NextJS`

> These layers receive updates once in a while, so don't forget to update them in the same way you added them

## Development

### Start development environment

- `npm run install:all`
- Setup and start the Firebase Emulator Suite
  - Install the Firebase CLI: `npm install -g firebase-tools`
  - Login with your Google Account: `firebase login`
  - Setup the emulators: `firebase init emulators`
- Setup the project's secrets
  - Create an API secrets file called `.env.secret.development` in the root of the project and fill it with the necessary secrets
  - Create a Web App secrets file called `.env.secret.development` in `client-side/web-app` and fill it with the necessary secrets
- From now on you can just run `npm run start:dev:infrastructure` in order to start all the services and infrastructure
- Set up an Alchemy account at <https://www.alchemy.com/>
- Create a Metamask Wallet
- Build the smart-contracts by running `NODE_ENV=development npm run build:smart-contracts`
- Deploy smart-contracts into a testnet
  - run `NODE_ENV=development npm run ts-node ./dist/scripts/deploy.ts`
  - take note of the contracts addresses and place them in `.env.secrets.development` to be used environment variables
- Seed the development database with sample data by running `NODE_ENV=development npm run seed`
- Start the server with `npm run start:dev`, or `npm run start:debug` if you want to debug the API in the Chrome Developer Tools
- To run the web app:
  - `cd client-side/web-app`
  - `npm run develop`

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

In order for a background job to run in a separate process and be compiled in a separate file from the server code, just have its file name end in `.job.ts`. The job function should also be wrapped around `prepareJob()` from `src/internals/jobs/run-job`. These wrapper functions do the usual setup like loading environment variables, logging and error handling.

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

#### Files to be changed

- .nvmrc
- BREAKING-CHANGES.md
- Dockerfile
- client-side/web-app/.nvmrc
- client-side/web-app/Dockerfile
- client-side/web-app/load-build-environment.js
- client-side/web-app/package-lock.json
- client-side/web-app/package.json
  - `engine` field
  - `@types/node` version
- package-lock.json
- package.json
  - `engine` field
  - `@types/node` version
- tsconfig.base.json
