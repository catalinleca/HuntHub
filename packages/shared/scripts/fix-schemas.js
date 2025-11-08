/* eslint-disable */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/schemas/gen/index.ts');
const content = fs.readFileSync(file, 'utf8');
const fixed = content.replace(
  /^export const schemas = \{$/m,
  'export const schemas: Record<string, z.ZodTypeAny> = {'
);
fs.writeFileSync(file, fixed, 'utf8');
