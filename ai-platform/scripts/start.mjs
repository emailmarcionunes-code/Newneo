import { cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const args = process.argv.slice(2);
let port = process.env.PORT ?? '3000';
let hostname = '127.0.0.1';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' || args[i] === '-p') port = args[++i];
  else if (args[i] === '--hostname' || args[i] === '-H') hostname = args[++i];
  else throw new Error('Unsupported start option');
}
if (
  !/^\d+$/.test(port) ||
  Number(port) < 1 ||
  Number(port) > 65535 ||
  !hostname
)
  throw new Error('Invalid server address');
await cp(new URL('public/', root), new URL('.next/standalone/public/', root), {
  recursive: true,
});
await cp(
  new URL('.next/static/', root),
  new URL('.next/standalone/.next/static/', root),
  { recursive: true },
);
process.env.PORT = port;
process.env.HOSTNAME = hostname;
process.chdir(fileURLToPath(new URL('.next/standalone/', root)));
await import(new URL('.next/standalone/server.js', root).href);
