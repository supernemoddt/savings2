import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const dir=await mkdtemp(join(tmpdir(),'savings-tests-'));
try {
 const out=join(dir,'model.test.mjs');
 await build({entryPoints:['tests/model.test.ts'],bundle:true,platform:'node',format:'esm',outfile:out});
 const result=spawnSync(process.execPath,['--test',out],{stdio:'inherit'});
 process.exitCode=result.status??1;
} finally {await rm(dir,{recursive:true,force:true});}
