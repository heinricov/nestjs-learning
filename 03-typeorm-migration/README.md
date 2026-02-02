- Generate module user

```bash
nest generate resource user modules --no-spec
```

- Update file `package.json`

```json
"scripts": {
  "typeorm": "typeorm-ts-node-commonjs",
  "migration:run": "npm run typeorm -- migration:run -d src/database/typeormConfig.ts",
  "migration:revert": "npm run typeorm -- migration:revert -d src/database/typeormConfig.ts",
  "migration:generate": "npm run typeorm -- migration:generate -d src/database/typeormConfig.ts src/database/migrations/migration"
}
```

- Generate migration file

```bash
npm run migration:generate
```

- Run migration file

```bash
npm run migration:run
```

- Revert migration file

```bash
npm run migration:revert
```
