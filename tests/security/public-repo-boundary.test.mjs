import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const SELF='tests/security/public-repo-boundary.test.mjs';
const SKIP_DIRS=new Set(['.git','node_modules','dist']);
const BLOCKED_EXTENSIONS=new Set(['.pem','.p12','.pfx','.key','.docx','.xlsx','.pptx','.pdf','.zip']);

const forbiddenMarkers=[
  ['Tek','ronyx'].join(''),
  ['AFR','-IX'].join(''),
  ['Kal','aam'].join(''),
  ['Pyra','mids Airlines'].join(''),
  ['Most','afa'].join(''),
  ['Marwan ','Rostom'].join(''),
  ['PO','04091'].join(''),
  ['PO','04337'].join('')
];

const secretPatterns=[
  /AIza[0-9A-Za-z_-]{20,}/,
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\s]+/i,
  /GEMINI_API_KEY\s*=\s*[^\s]+/i
];

function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name.startsWith('.') && entry.name!=='.github' && dir===ROOT) {
      if(entry.name!=='.gitignore') continue;
    }
    if(SKIP_DIRS.has(entry.name)) continue;
    const full=path.join(dir,entry.name);
    const rel=path.relative(ROOT,full).replaceAll('\\','/');
    if(rel===SELF) continue;
    if(entry.isDirectory()) out.push(...walk(full));
    else out.push({full,rel});
  }
  return out;
}

test('public repository contains no obvious private artifacts or credentials',()=>{
  for(const {full,rel} of walk(ROOT)){
    const ext=path.extname(rel).toLowerCase();
    assert.ok(!BLOCKED_EXTENSIONS.has(ext),`blocked artifact type in public repository: ${rel}`);
    const stat=fs.statSync(full);
    if(stat.size>1024*1024) continue;
    let content;
    try { content=fs.readFileSync(full,'utf8'); } catch { continue; }
    for(const marker of forbiddenMarkers){
      assert.ok(!content.toLowerCase().includes(marker.toLowerCase()),`private marker found in ${rel}`);
    }
    for(const pattern of secretPatterns){
      assert.ok(!pattern.test(content),`credential-like material found in ${rel}`);
    }
  }
});
