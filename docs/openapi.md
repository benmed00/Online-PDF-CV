# OpenAPI documentation

Machine-readable API contract for Online-PDF-CV. Closes [GitHub issue #34](https://github.com/benmed00/Online-PDF-CV/issues/34).

## Quick links

| Resource     | URL (local)                                  | Purpose                                               |
| ------------ | -------------------------------------------- | ----------------------------------------------------- |
| OpenAPI YAML | `/api/openapi.yaml`                          | Canonical contract (OpenAPI 3.1)                      |
| Swagger UI   | `/api/docs`                                  | Interactive Try it out / Execute (local Express only) |
| Human docs   | `/docs`                                      | Examples and version list                             |
| Wiki         | [API-Reference.md](../wiki/API-Reference.md) | Narrative reference                                   |

## Source-of-truth layout

```
openapi/
├── openapi.base.yaml   # info, servers, tags, component schemas (edit manually)
├── jsdoc-routes.js     # path/operation definitions via @openapi JSDoc (edit on route changes)
└── openapi.yaml        # GENERATED — merge of base + JSDoc (do not hand-edit paths)
```

| Layer               | File                        | When to edit                                                  |
| ------------------- | --------------------------- | ------------------------------------------------------------- |
| Schemas & metadata  | `openapi/openapi.base.yaml` | New response models, version bump (or `npm run version:sync`) |
| Routes & operations | `openapi/jsdoc-routes.js`   | New/changed endpoints in `app.js`                             |
| Generated output    | `openapi/openapi.yaml`      | Never directly — run `npm run openapi:generate`               |
| Static deploy copy  | `public/api/openapi.yaml`   | Produced by `npm run build`                                   |

## Commands

```bash
npm run openapi:generate   # Regenerate openapi/openapi.yaml from JSDoc + base
npm run openapi:lint       # Redocly validate (CI gate)
npm run openapi:validate   # generate + lint
```

`npm run validate` runs `openapi:generate` before lint and tests.

## Traceability index

| Concern                 | Implementation                                                | Tests                                                                       |
| ----------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Spec generation         | [scripts/generate-openapi.js](../scripts/generate-openapi.js) | [**tests**/generate-openapi.test.js](../__tests__/generate-openapi.test.js) |
| Route handlers          | [app.js](../app.js)                                           | [**tests**/api.test.js](../__tests__/api.test.js)                           |
| Swagger UI              | [app.js](../app.js) (`/api/docs`)                             | [**tests**/openapi.test.js](../__tests__/openapi.test.js)                   |
| Static publish          | [scripts/build-static.js](../scripts/build-static.js)         | [**tests**/build-static.test.js](../__tests__/build-static.test.js)         |
| Version sync            | [scripts/sync-version.js](../scripts/sync-version.js)         | [**tests**/sync-version.test.js](../__tests__/sync-version.test.js)         |
| Interactive Swagger e2e | [e2e/openapi.spec.js](../e2e/openapi.spec.js)                 | Playwright: Try it out → Execute → HTTP assert                              |
| Firebase headers        | [firebase.json](../firebase.json)                             | Manual / post-deploy                                                        |
| Lint rules              | [.redocly.yaml](../.redocly.yaml)                             | `openapi:lint` in CI                                                        |

## Server URLs in Swagger UI

The default OpenAPI server is `/` (same-origin) so **Try it out** requests hit the current host. That avoids CORS failures when the browser uses `127.0.0.1` while the spec listed `localhost`. Production Firebase is available as the second server entry.

## Deployment model

| Endpoint                | Firebase Hosting only | Firebase + Cloud Function `api` | Express (`npm start`) |
| ----------------------- | --------------------- | ------------------------------- | --------------------- |
| `GET /api/openapi.yaml` | Yes (after build)     | Yes                             | Yes                   |
| `GET /api/docs`         | No                    | No                              | Swagger UI            |
| `GET /api/versions`     | Yes (static rewrite)  | Yes                             | Yes                   |
| Analyzer routes         | No                    | Yes                             | Yes                   |

Analyzer operations are tagged `x-node-runtime: true` in the spec — they require a Node backend (Express locally or the `api` Cloud Function on Firebase). See [functions/README.md](../functions/README.md).

## What is “strict AJV validation on every response”?

**AJV** (Another JSON Schema Validator) is a library that checks runtime JSON against a JSON Schema.

**Strict AJV on every response** would mean: after each API handler runs, the outgoing JSON is validated against the OpenAPI `components.schemas` before it is sent. If the payload does not match the schema, the server would return 500 instead of the response.

**This project does not implement that** because:

- It adds runtime overhead and maintenance (schemas must stay perfectly in sync with code paths).
- Some fields are optional or conditional (e.g. `aiInsights` skipped vs populated).
- Contract checks are covered instead by: Redocly lint, Jest smoke tests, and Playwright Swagger execution tests.

**Optional future work:** add AJV validation in tests only (supertest response vs schema) for critical endpoints — not in production middleware.

## Contributing

When changing API routes:

1. Update handler in `app.js`
2. Update `@openapi` block in `openapi/jsdoc-routes.js`
3. Update schemas in `openapi/openapi.base.yaml` if shapes changed
4. Run `npm run openapi:validate`
5. Update [wiki/API-Reference.md](../wiki/API-Reference.md) if behaviour is user-facing
