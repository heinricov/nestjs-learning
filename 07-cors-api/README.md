# CORS API

## Packages

we need to install the following packages:

```bash
npm install @nestjs/typeorm typeorm pg reflect-metadata dotenv
npm install -D @types/node
npm install class-transformer class-validator
```

## Setup TypeORM

create a new file `src/database/typeorm.config.ts` and `.env` in the root of the project.

```bash
mkdir src/database
touch src/database/typeormConfig.ts
touch .env
```

insert code from `typeorm.config.ts`:

```ts
import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'mydatabase',
  schema: process.env.DB_SCHEMA ?? 'public',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: (process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  ...dataSourceOptions,
  autoLoadEntities: true,
  synchronize: (process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
};

export const dataSource = new DataSource(dataSourceOptions);
```

update file `.env`:

```ts
PORT = 4000;
DB_HOST = localhost;
DB_PORT = 5432;
DB_USERNAME = postgres;
DB_PASSWORD = postgres;
DB_NAME = postgres;
DB_SYNCHRONIZE = true;
DB_SCHEMA = public;
```

update file `src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './database/typeormConfig';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

update file `src/main.ts`:

```ts
import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  console.log(`your aplikasi runing in http://localhost:${port}`);
}
void bootstrap();
```

## Create Migration

update `package.json`:

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:run": "npm run typeorm -- migration:run -d src/database/typeormConfig.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/database/typeormConfig.ts",
    "migration:generate": "npm run typeorm -- migration:generate -d src/database/typeormConfig.ts src/database/migrations/migration"
  }
}
```

module entity `post`

```bash
nest g resource post modules --no-spec
```

update `src/modules/post/post.entity.ts`:

```ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
```

create migration file

```bash
npm run migration:generate
```

run migration

```bash
npm run migration:run
```

cost need revert migration run to undo the last migration

```bash
npm run migration:revert
```

## Endpoint

- `POST /posts` - Create a new post
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get a post by ID
- `PUT /posts/:id` - Update a post by ID
- `DELETE /posts/:id` - Delete a post by ID

### GET: `/posts`

- Description: Get all posts
- Response Status Code: 200 OK
  - Body:
  ```json
  [
    {
      "statusCode": 200,
      "count": 2,
      "updatedAt": "2023-01-02T00:00:00.000Z",
      "data": [
        {
          "id": 1,
          "title": "Post 1",
          "content": "Content of Post 1",
          "createdAt": "2023-01-01T00:00:00.000Z",
          "updatedAt": "2023-01-01T00:00:00.000Z"
        },
        {
          "id": 2,
          "title": "Post 2",
          "content": "Content of Post 2",
          "createdAt": "2023-01-02T00:00:00.000Z",
          "updatedAt": "2023-01-02T00:00:00.000Z"
        }
      ]
    }
  ]
  ```
- Response Status Code: 404 Not Found
  - Body:
    ```json
    {
      "statusCode": 404,
      "message": "Post not found"
    }
    ```

### GET: `/posts/:id`

- Description: Get a post by ID
- Response Status Code: 200 OK
  - Body:
  ```json
  [
    {
      "statusCode": 200,
      "data": {
        "id": 1,
        "title": "Post 1",
        "content": "Content of Post 1",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    }
  ]
  ```
- Response Status Code: 404 Not Found
  - Body:
    ```json
    {
      "statusCode": 404,
      "message": "Post not found"
    }
    ```

### POST: `/posts`

- Description: Create a new post
- Response Status Code: 201 Created
  - Body:
  ```json
  [
    {
      "statusCode": 201,
      "data": {
        "id": 3,
        "title": "Post 3",
        "content": "Content of Post 3",
        "createdAt": "2023-01-03T00:00:00.000Z",
        "updatedAt": "2023-01-03T00:00:00.000Z"
      }
    }
  ]
  ```
- Response Status Code: 400 Bad Request
  - Body:
    ```json
    {
      "statusCode": 400,
      "message": "Title and content are required"
    }
    ```
- Request Body:
  ```json
  {
    "title": "Post 3",
    "content": "Content of Post 3"
  }
  ```

### PATCH: `/posts/:id`

- Description: Update a post by ID
- Response Status Code: 200 OK
  - Body:
  ```json
  [
    {
      "statusCode": 200,
      "data": {
        "id": 3,
        "title": "Updated Post 3",
        "content": "Updated Content of Post 3",
        "createdAt": "2023-01-03T00:00:00.000Z",
        "updatedAt": "2023-01-03T00:00:00.000Z"
      }
    }
  ]
  ```
- Response Status Code: 404 Not Found
  - Body:
    ```json
    {
      "statusCode": 404,
      "message": "Post not found"
    }
    ```
- Request Body:
  ```json
  {
    "title": "Updated Post 3",
    "content": "Updated Content of Post 3"
  }
  ```

### DELETE: `/posts/:id`

- Description: Delete a post by ID
- Response Status Code: 200 OK
  - Body:
  ```json
  [
    {
      "statusCode": 200,
      "message": "Post deleted successfully"
    }
  ]
  ```
- Response Status Code: 404 Not Found
  - Body:
    ```json
    {
      "statusCode": 404,
      "message": "Post not found"
    }
    ```

### DELETE: `/posts`

- Description: Delete all posts
- Response Status Code: 200 OK
  - Body:
  ```json
  [
    {
      "statusCode": 200,
      "message": "All posts deleted successfully"
    }
  ]
  ```
- Response Status Code: 404 Not Found
  - Body:
    ```json
    {
      "statusCode": 404,
      "message": "Post not found"
    }
    ```

- update file `src/modules/post/post.controller.ts`, see code in [post.controller.ts](src/modules/post/post.controller.ts)
- update file `src/modules/post/post.service.ts`, see code in [post.service.ts](src/modules/post/post.service.ts)
- update file `src/modules/post/dto/create-post.dto.ts`, see code in [create-post.dto.ts](src/modules/post/dto/create-post.dto.ts)
- update file `src/modules/post/dto/update-post.dto.ts`, see code in [update-post.dto.ts](src/modules/post/dto/update-post.dto.ts)

## Test

run project

```bash
npm run start:dev
```

## Set CORS

- update file `src/main.ts`, see code in [main.ts](src/main.ts)

```ts

```
