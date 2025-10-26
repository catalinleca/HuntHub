import { generateApi } from 'swagger-typescript-api';
import * as path from 'path';

async function generate() {
  console.log('Generating TypeScript types from OpenAPI...');

  await generateApi({
    input: path.resolve(__dirname, '../openapi/hunthub_models.yaml'),
    output: path.resolve(__dirname, '../src/types'),
    fileName: 'index.ts', // ← For v13, use 'name' not 'fileName'

    httpClientType: 'fetch',
    generateClient: false,

    generateRouteTypes: false,

    extractRequestParams: false,
    extractRequestBody: false,
    extractResponseBody: false,
    extractResponseError: false,

    cleanOutput: true,

    modular: false,
  });

  console.log('✓ Types generated at src/types/index.ts');
  console.log('Note: Zod schemas will be generated in future step');
}

generate().catch((error) => {
  console.error('❌ Failed to generate types:', error);
  process.exit(1);
});
