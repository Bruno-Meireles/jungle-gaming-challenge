// Registra início e fim de cada ação (ferramenta) em logs/actions.jsonl.
// Uso: hook PreToolUse chama `node tools/action-log.mjs start`; PostToolUse chama `... end`.
// Nunca falha nem escreve na saída: um log quebrado não pode interromper o trabalho.
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const phase = process.argv[2];
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'logs', 'actions.jsonl');
const MAX_SUMMARY = 160;

const summarize = (input = {}) => {
  const raw = input.command ?? input.file_path ?? input.pattern ?? input.description ?? input.prompt ?? '';
  return String(raw).replace(/\s+/g, ' ').slice(0, MAX_SUMMARY);
};

const findStart = (id) => {
  try {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      if (lines[i].includes(`"id":"${id}"`) && lines[i].includes('"phase":"start"')) {
        return JSON.parse(lines[i]);
      }
    }
  } catch {
    // sem início encontrado: o fim é registrado sem duração
  }
  return null;
};

let raw = '';
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(raw || '{}');
    const now = Date.now();
    const id = data.tool_use_id ?? '';
    const entry = {
      phase,
      ts: new Date(now).toISOString(),
      id,
      tool: data.tool_name ?? '',
      agent: data.agent_type ?? data.agent_id ?? 'main',
      summary: summarize(data.tool_input),
    };
    if (phase === 'end') {
      const start = findStart(id);
      if (start) entry.durationMs = now - Date.parse(start.ts);
    }
    mkdirSync(dirname(file), { recursive: true });
    appendFileSync(file, `${JSON.stringify(entry)}\n`);
  } catch {
    // ignora
  }
});
