/* eslint-disable */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/schemas/gen/index.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/^export const schemas = \{$/m, 'export const schemas: Record<string, z.ZodTypeAny> = {');

content = content.replace(/^const ([A-Z]\w+) =/gm, 'export const $1 =');

fs.writeFileSync(file, content, 'utf8');
