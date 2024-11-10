/* eslint-disable auto-js-extension/auto-js-extension */
import path from 'path';
import fs from 'fs';
import { __dirname } from './dirname.cjs';

export function read(filePath) {
  try {
    const data = fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}
