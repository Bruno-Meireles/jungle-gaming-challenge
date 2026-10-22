import { cpSync } from 'node:fs';

/* tsc emite so JS/.d.ts; CSS e fontes vao para dist com a mesma estrutura relativa de src. */
cpSync('src/styles', 'dist/styles', { recursive: true, filter: (path) => !/\.test\.tsx?$/.test(path) });
cpSync('src/fonts', 'dist/fonts', { recursive: true });
