import * as path from 'path';
import * as fs from 'fs';
import * as yml from 'js-yaml';
console.log(`${process.env.NODE_ENV}`);

const envFilePath = path.join(
  __dirname,
  `../../config/config.${process.env.NODE_ENV || 'development'}.yml`,
);
const fileContent = fs.readFileSync(envFilePath, 'utf-8');
export default () => yml.load(fileContent) as Record<string, any>;
