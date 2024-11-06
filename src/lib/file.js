/* eslint-disable auto-js-extension/auto-js-extension */
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

export function getDirname() {
  return path.dirname(fileURLToPath(import.meta.url));
}

export function read(filePath) {
  try {
    const data = fs.readFileSync(path.resolve(getDirname(), filePath), 'utf-8');

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}
