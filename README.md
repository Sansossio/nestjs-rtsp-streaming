# NestJS Rtsp

# Start project
```sh
yarn # or yarn install
yarn start api
```

And then go to [http://localhsot:3000](http://localhost:3000)

## NX workflow

### Generate a nestJS application

`nx generate @nrwl/nest:application my-app`

### Generate an express application

`nx generate @nrwl/express:application my-app`

### Generate a serverless application

`nx g @flowaccount/nx-serverless:api-serverless --provider=aws --name=myapi`

### Generate simple library

Module **not** needed to use this library.

`nx generate @nrwl/workspace:library mylib`

Import from `@nestjs-rtsp-streaming/mylib`.

### Generate a Nest library

This should be preferred option to create Nest libraries since this command add the library to the NX _chain_ of testing, etc...

`nx generate @nrwl/nest:library my-lib`

Use prefix `@nestjs-rtsp-streaming`.

Import from `@nestjs-rtsp-streaming/mylib`.

### Delete lib, app

`nx generate rm my-lib`
`nx generate rm my-app`
