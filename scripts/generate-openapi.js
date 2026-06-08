#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const yaml = require('yaml');

const ROOT = path.join(__dirname, '..');
const BASE_PATH = path.join(ROOT, 'openapi', 'openapi.base.yaml');
const OUTPUT_PATH = path.join(ROOT, 'openapi', 'openapi.yaml');
const JSDOC_ROUTES = path.join(ROOT, 'openapi', 'jsdoc-routes.js');

function generateOpenApiSpec() {
  const base = yaml.parse(fs.readFileSync(BASE_PATH, 'utf8'));

  const spec = swaggerJsdoc({
    definition: base,
    apis: [JSDOC_ROUTES],
  });

  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    throw new Error('swagger-jsdoc produced no paths — check openapi/jsdoc-routes.js');
  }

  fs.writeFileSync(OUTPUT_PATH, yaml.stringify(spec), 'utf8');
  console.log(
    `Generated openapi/openapi.yaml (${Object.keys(spec.paths).length} paths from JSDoc + base schemas)`
  );

  return spec;
}

if (require.main === module) {
  try {
    generateOpenApiSpec();
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}

module.exports = { generateOpenApiSpec, BASE_PATH, OUTPUT_PATH, JSDOC_ROUTES };
